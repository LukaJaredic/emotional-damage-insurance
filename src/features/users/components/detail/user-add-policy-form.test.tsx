import { screen, waitFor } from '@testing-library/dom'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { addDays } from 'date-fns'
import { HttpResponse, http } from 'msw'

import type { PolicyDto } from '@/api/policies'
import { env } from '@/config'
import { server } from '@/testing/mocks/server'
import { renderApp, testAuditFields, testUsers } from '@/testing/test-utils'
import type { PolicyLimits } from '@/types'

import UserAddPolicyForm, {
  type UserAddPolicyFormProps,
  type UserAddPolicyFormStatus,
} from './user-add-policy-form'

const policyLimits: PolicyLimits = {
  insult: 1_000,
  rejection: 2_000,
  badJoke: 3_000,
  gaslighting: 4_000,
  overthinking: 5_000,
  awkwardSilence: 6_000,
  whyDontYouQuestion: 7_000,
  meetingThatCouldHaveBeenEmail: 8_000,
}

const policy: PolicyDto = {
  ...testAuditFields,
  id: 'policy-to-add',
  policyHolderId: 'policy-holder-id',
  terminated: false,
  name: 'Dental kindness cover',
  premium: 120,
  startDate: addDays(new Date(), -10).toISOString(),
  endDate: addDays(new Date(), 60).toISOString(),
  limits: policyLimits,
}

function mockPolicies(onRequest?: (searchParams: URLSearchParams) => void) {
  server.use(
    http.get(`${env.API_URL}/policies`, ({ request }) => {
      onRequest?.(new URL(request.url).searchParams)

      return HttpResponse.json([policy])
    }),
  )
}

function mockConnectPolicyUser(
  onRequest?: (request: { policyId: string; body: unknown }) => void,
) {
  server.use(
    http.post(
      `${env.API_URL}/policies/:policyId/users`,
      async ({ params, request }) => {
        onRequest?.({
          policyId: String(params.policyId),
          body: await request.json(),
        })

        return HttpResponse.json(
          {
            ...testAuditFields,
            id: 'created-policy-user-id',
            policyId: String(params.policyId),
            userId: testUsers.customer.id,
          },
          { status: 201 },
        )
      },
    ),
  )
}

async function renderForm(props: Partial<UserAddPolicyFormProps> = {}) {
  const view = await renderApp(
    <UserAddPolicyForm user={testUsers.customer} {...props} />,
    {
      user: testUsers.admin,
    },
  )

  return { ...view, user: userEvent.setup() }
}

async function selectPolicy(user: UserEvent) {
  await user.click(screen.getByLabelText('Policy'))
  await user.click(await screen.findByText(/Dental kindness cover/))
}

describe('UserAddPolicyForm', () => {
  it('should render the policy select and submit button by default', async () => {
    mockPolicies()
    await renderForm()

    expect(screen.getByLabelText('Policy')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add policy' }),
    ).toBeInTheDocument()
  })

  it('should hide the optional submit button', async () => {
    mockPolicies()
    await renderForm({ showSubmit: false })

    expect(screen.getByLabelText('Policy')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Add policy' }),
    ).not.toBeInTheDocument()
  })

  it('should request active policies that are not expired', async () => {
    const requests: URLSearchParams[] = []
    mockPolicies((searchParams) => requests.push(searchParams))
    const { user } = await renderForm()

    await user.click(screen.getByLabelText('Policy'))

    await waitFor(() => {
      expect(requests).toHaveLength(1)
    })
    expect(requests[0]?.get('terminated')).toBe('false')
    expect(requests[0]?.get('expired')).toBe('false')
  })

  it('should connect the selected policy and report pending then success', async () => {
    const requests: { policyId: string; body: unknown }[] = []
    const handleStatusChange =
      vi.fn<(status: UserAddPolicyFormStatus) => void>()
    mockPolicies()
    mockConnectPolicyUser((request) => requests.push(request))
    const { user } = await renderForm({ onStatusChange: handleStatusChange })

    await selectPolicy(user)
    await user.click(screen.getByRole('button', { name: 'Add policy' }))

    expect(handleStatusChange).toHaveBeenCalledWith('pending')
    await waitFor(() => {
      expect(requests).toEqual([
        { policyId: policy.id, body: { userId: testUsers.customer.id } },
      ])
      expect(handleStatusChange).toHaveBeenCalledWith('success')
    })
  })

  it('should require a policy before submit', async () => {
    const requests: { policyId: string; body: unknown }[] = []
    mockPolicies()
    mockConnectPolicyUser((request) => requests.push(request))
    const { user } = await renderForm()

    await user.click(screen.getByRole('button', { name: 'Add policy' }))

    expect(
      await screen.findByText('Choose a policy to add.'),
    ).toBeInTheDocument()
    expect(requests).toHaveLength(0)
  })
})
