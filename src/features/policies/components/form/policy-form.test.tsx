import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { env } from '@/config'
import { server } from '@/testing/mocks/server'
import { renderApp, testAuditFields, testUsers } from '@/testing/test-utils'
import type { PolicyHolder } from '@/types'
import { limitLabels } from '@/utils/policy-limit-labels'
import type { PolicyFormStatus } from '@features/policies/types/policy-form.types'

import PolicyForm from './policy-form'
import type { PolicyFormProps } from './policy-form'

const policyHolder: PolicyHolder = {
  ...testAuditFields,
  id: 'policy-holder-id',
  type: 'business',
  businessName: 'Acme Insurance',
  governmentId: '12345678',
  email: 'acme@example.com',
  phone: '+38269123456',
} as const

function mockPolicyHolders() {
  server.use(
    http.get(`${env.API_URL}/policy-holders`, () =>
      HttpResponse.json([policyHolder]),
    ),
  )
}

function mockCreatePolicy({
  status = 201,
  onRequest,
}: {
  status?: number
  onRequest?: ((body: unknown) => void) | undefined
} = {}) {
  server.use(
    http.post(`${env.API_URL}/policies`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      onRequest?.(body)

      if (status >= 400) {
        return HttpResponse.json(
          {
            error: {
              code: 'POLICY_ALREADY_EXISTS',
              message: 'A policy with this name already exists.',
              status,
              fieldErrors: {
                name: ['A policy with this name already exists.'],
              },
            },
          },
          { status },
        )
      }

      return HttpResponse.json(
        {
          ...testAuditFields,
          id: 'created-policy-id',
          terminated: false,
          ...body,
        },
        { status },
      )
    }),
  )
}

async function renderPolicyForm({
  showSubmit,
  onStatusChange,
}: {
  showSubmit?: boolean | undefined
  onStatusChange?: PolicyFormProps['onStatusChange']
} = {}) {
  mockPolicyHolders()
  await renderApp(
    <PolicyForm showSubmit={showSubmit} onStatusChange={onStatusChange} />,
    {
      user: testUsers.admin,
    },
  )

  return { user: userEvent.setup() }
}

async function selectPolicyHolder(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText('Policy holder'))
  await user.click(
    await screen.findByRole('option', {
      name: `[${policyHolder.governmentId}] ${(policyHolder as any).businessName}`,
    }),
  )
}

async function fillValidPolicyFields(user: ReturnType<typeof userEvent.setup>) {
  await selectPolicyHolder(user)
  await user.type(screen.getByLabelText('Name'), 'Premium coverage')
  await user.clear(screen.getByLabelText('Premium'))
  await user.type(screen.getByLabelText('Premium'), '250')
}

describe('PolicyForm', () => {
  describe('renders', () => {
    it('should show correct fields', async () => {
      await renderPolicyForm()

      expect(screen.getByLabelText('Policy holder')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Premium')).toBeInTheDocument()
      expect(screen.getByLabelText('Start date')).toBeInTheDocument()
      expect(screen.getByLabelText('End date')).toBeInTheDocument()
      expect(screen.getByText('Limits')).toBeInTheDocument()
      for (const label of Object.values(limitLabels)) {
        expect(screen.getByLabelText(label)).toBeInTheDocument()
      }
      expect(
        screen.getByRole('button', { name: 'Create policy' }),
      ).toBeInTheDocument()
    })

    it('should hide submit button', async () => {
      await renderPolicyForm({ showSubmit: false })

      expect(
        screen.queryByRole('button', { name: 'Create policy' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should prevent submit when invalid', async () => {
      const requests: unknown[] = []
      mockCreatePolicy({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      const { user } = await renderPolicyForm()

      await user.click(screen.getByRole('button', { name: 'Create policy' }))

      expect(
        await screen.findByText('Premium must be greater than zero'),
      ).toBeInTheDocument()
      expect(requests).toHaveLength(0)
    })

    it('should create a policy when valid', async () => {
      const requests: unknown[] = []
      mockCreatePolicy({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      const { user } = await renderPolicyForm()

      await fillValidPolicyFields(user)
      await user.click(screen.getByRole('button', { name: 'Create policy' }))

      await waitFor(() => {
        expect(requests).toEqual([
          expect.objectContaining({
            policyHolderId: policyHolder.id,
            name: 'Premium coverage',
            premium: 250,
          }),
        ])
      })
    })
  })

  describe('status changes', () => {
    it('should call #onStatusChange() with "pending" and "success" when submitted successfully', async () => {
      const handleStatusChange = vi.fn<(status: PolicyFormStatus) => void>()
      mockCreatePolicy()
      const { user } = await renderPolicyForm({
        onStatusChange: handleStatusChange,
      })

      await fillValidPolicyFields(user)
      await user.click(screen.getByRole('button', { name: 'Create policy' }))

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      await waitFor(() => {
        expect(handleStatusChange).toHaveBeenCalledWith('success')
      })
    })

    it('should call #onStatusChange() with "pending" and "idle" when submitted unsuccessfully', async () => {
      const handleStatusChange = vi.fn<(status: PolicyFormStatus) => void>()
      mockCreatePolicy({ status: 409 })
      const { user } = await renderPolicyForm({
        onStatusChange: handleStatusChange,
      })

      await fillValidPolicyFields(user)
      await user.click(screen.getByRole('button', { name: 'Create policy' }))

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      await waitFor(() => {
        expect(handleStatusChange).toHaveBeenCalledWith('idle')
      })
    })
  })
})
