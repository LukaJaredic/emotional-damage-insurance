import { screen } from '@testing-library/dom'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import { renderApp, selectOptions, testUsers } from '@/testing/test-utils'
import type { PolicyHolder, PolicyHolderType } from '@/types'
import type { PolicyHolderFormStatus } from '@features/policy-holders/types/policy-holder-form.types'

import PolicyHolderForm from './policy-holder-form'
import type { PolicyHolderFormProps } from './policy-holder-form'

type PolicyHoldersByType = {
  [Type in PolicyHolderType]: Extract<PolicyHolder, { type: Type }>
}

type UserActor = ReturnType<typeof userEvent.setup>

const testPolicyHolders = {
  business: {
    id: 'business-policy-holder-id',
    type: 'business',
    businessName: 'Acme Insurance',
    governmentId: '12345678',
    email: 'acme@example.com',
    phone: '+38269123456',
  },
  individual: {
    id: 'individual-policy-holder-id',
    type: 'individual',
    firstName: 'John',
    lastName: 'Doe',
    governmentId: '1234567890123',
    email: 'john.doe@example.com',
    phone: '+38269123457',
  },
} satisfies PolicyHoldersByType

function mockPolicyHolderResponses({
  status = 201,
  onRequest,
}: {
  status?: number
  onRequest?: ((body: unknown) => void) | undefined
} = {}) {
  server.use(
    http.post(`${env.API_URL}/policy-holders`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      onRequest?.(body)

      if (status >= 400) {
        return HttpResponse.json({ message: 'Server Error' }, { status })
      }

      return HttpResponse.json(
        { id: 'created-policy-holder-id', ...body },
        { status },
      )
    }),
  )

  server.use(
    http.patch(
      `${env.API_URL}/policy-holders/:policyHolderId`,
      async ({ request, params }) => {
        const body = (await request.json()) as Record<string, unknown>
        onRequest?.({ body, id: params.policyHolderId })

        if (status >= 400) {
          return HttpResponse.json({ message: 'Server Error' }, { status })
        }

        return HttpResponse.json(
          { id: params.policyHolderId, ...body },
          { status },
        )
      },
    ),
  )
}

async function renderForm(
  policyHolder?: PolicyHolder,
  onStatusChange?: (status: PolicyHolderFormStatus) => void,
  showSubmit: boolean = true,
) {
  await renderApp(
    <PolicyHolderForm
      policyHolder={policyHolder}
      onStatusChange={onStatusChange}
      showSubmit={showSubmit}
    />,
    {
      user: testUsers.admin,
    },
  )

  return { user: userEvent.setup() }
}

async function selectPolicyHolderType(label: 'Business' | 'Individual') {
  await selectOptions(screen.getByRole('combobox', { name: 'Type' }), [label])
}

async function fillBusinessFields(
  user: UserActor,
  policyHolder: Extract<PolicyHolder, { type: 'business' }>,
  overrides?: Partial<Extract<PolicyHolder, { type: 'business' }>>,
) {
  const values = { ...policyHolder, ...overrides }

  if (!screen.queryByLabelText('Business name')) {
    await selectPolicyHolderType('Business')
  }

  const businessNameInput = screen.getByLabelText(
    'Business name',
  ) as HTMLInputElement
  const governmentIdInput = screen.getByLabelText('Tax ID') as HTMLInputElement
  const emailInput = screen.getByLabelText('Email') as HTMLInputElement
  const phoneInput = screen.getByLabelText('Phone') as HTMLInputElement

  await Promise.all([
    user.clear(businessNameInput),
    user.clear(governmentIdInput),
    user.clear(emailInput),
    user.clear(phoneInput),
  ])

  await user.type(businessNameInput, values.businessName)
  await user.type(governmentIdInput, values.governmentId)
  await user.type(emailInput, values.email)
  await user.type(phoneInput, values.phone)
}

async function fillIndividualFields(
  user: UserActor,
  policyHolder: Extract<PolicyHolder, { type: 'individual' }>,
  overrides?: Partial<Extract<PolicyHolder, { type: 'individual' }>>,
) {
  const values = { ...policyHolder, ...overrides }

  if (!screen.queryByLabelText('First name')) {
    await selectPolicyHolderType('Individual')
  }

  const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement
  const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement
  const governmentIdInput = screen.getByLabelText(
    'Government ID',
  ) as HTMLInputElement
  const emailInput = screen.getByLabelText('Email') as HTMLInputElement
  const phoneInput = screen.getByLabelText('Phone') as HTMLInputElement

  await Promise.all([
    user.clear(firstNameInput),
    user.clear(lastNameInput),
    user.clear(governmentIdInput),
    user.clear(emailInput),
    user.clear(phoneInput),
  ])

  await user.type(firstNameInput, values.firstName)
  await user.type(lastNameInput, values.lastName)
  await user.type(governmentIdInput, values.governmentId)
  await user.type(emailInput, values.email)
  await user.type(phoneInput, values.phone)
}

describe('PolicyHolderForm', () => {
  describe('renders', () => {
    it('should render fields for business policy holder', async () => {
      await renderForm()

      expect(screen.getByLabelText('Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Business name')).toBeInTheDocument()
      expect(screen.getByLabelText('Tax ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Create policy holder' }),
      ).toBeInTheDocument()
    })

    it('should render fields for individual policy holder', async () => {
      await renderForm()

      await selectPolicyHolderType('Individual')

      expect(await screen.findByLabelText('First name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last name')).toBeInTheDocument()
      expect(screen.getByLabelText('Government ID')).toBeInTheDocument()
      expect(screen.queryByLabelText('Business name')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Tax ID')).not.toBeInTheDocument()
    })

    it('should hide submit button', async () => {
      await renderForm(undefined, () => {}, false)

      expect(
        screen.queryByRole('button', { name: /create policy holder/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should prevent submit when invalid', async () => {
      const requests: unknown[] = []
      mockPolicyHolderResponses({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      const { user } = await renderForm()

      await fillBusinessFields(user, testPolicyHolders.business, {
        email: 'invalid-email',
      })
      await user.click(
        screen.getByRole('button', { name: 'Create policy holder' }),
      )

      expect(
        await screen.findByText('Invalid email address'),
      ).toBeInTheDocument()
      expect(requests).toHaveLength(0)
    })

    it('should create a business policy holder when valid', async () => {
      const requests: unknown[] = []
      mockPolicyHolderResponses({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      const { user } = await renderForm()

      await fillBusinessFields(user, testPolicyHolders.business)
      await user.click(
        screen.getByRole('button', { name: 'Create policy holder' }),
      )

      const expectedFormData = {
        ...testPolicyHolders.business,
      } as any
      delete expectedFormData.id

      await waitFor(() => {
        expect(requests).toEqual([expectedFormData])
      })
    })

    it('should create an individual policy holder when valid', async () => {
      const requests: unknown[] = []
      mockPolicyHolderResponses({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      const { user } = await renderForm()

      await fillIndividualFields(user, testPolicyHolders.individual)
      await user.click(
        screen.getByRole('button', { name: 'Create policy holder' }),
      )

      const expectedFormData = {
        ...testPolicyHolders.individual,
      } as any
      delete expectedFormData.id

      await waitFor(() => {
        expect(requests).toEqual([expectedFormData])
      })
    })

    it('should update when valid', async () => {
      const requests: unknown[] = []
      mockPolicyHolderResponses({
        onRequest: (data) => {
          requests.push(data)
        },
      })
      const { user } = await renderForm(testPolicyHolders.individual)

      await fillIndividualFields(user, testPolicyHolders.individual, {
        firstName: 'Jane',
      })
      await user.click(
        screen.getByRole('button', { name: 'Save policy holder' }),
      )

      const expectedFormData = {
        ...testPolicyHolders.individual,
        firstName: 'Jane',
      } as any
      delete expectedFormData.id

      await waitFor(() => {
        expect(requests).toEqual([
          { id: 'individual-policy-holder-id', body: expectedFormData },
        ])
      })
    })
  })

  describe('status changes', () => {
    let handleStatusChange!: ReturnType<typeof vi.fn>
    let submitButton!: HTMLElement
    let user!: UserActor

    beforeEach(async () => {
      handleStatusChange = vi.fn()
      user = (
        await renderForm(
          undefined,
          handleStatusChange as PolicyHolderFormProps['onStatusChange'],
        )
      ).user
      submitButton = screen.getByRole('button', {
        name: 'Create policy holder',
      })
    })

    it('should call #onStatusChange() with "pending" and "success" when submitted successfully', async () => {
      mockPolicyHolderResponses()

      await fillBusinessFields(user, testPolicyHolders.business)
      await user.click(submitButton)

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      await waitFor(() => {
        expect(handleStatusChange).toHaveBeenCalledWith('success')
      })
    })

    it('should call #onStatusChange() with "pending" and "idle" when submitted unsuccessfully', async () => {
      mockPolicyHolderResponses({ status: 500 })

      await fillBusinessFields(user, testPolicyHolders.business)
      await user.click(submitButton)

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      await waitFor(() => {
        expect(handleStatusChange).toHaveBeenCalledWith('idle')
      })
    })
  })
})
