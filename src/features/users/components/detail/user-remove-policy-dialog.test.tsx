import { screen, waitFor, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { addDays } from 'date-fns'
import { HttpResponse, http } from 'msw'

import { env } from '@/config'
import { server } from '@/testing/mocks/server'
import { renderApp, testAuditFields, testUsers } from '@/testing/test-utils'
import type { PolicyLimits, PolicyWithUserLimits } from '@/types'

import UserRemovePolicyDialog from './user-remove-policy-dialog'

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

const policy: PolicyWithUserLimits = {
  ...testAuditFields,
  id: 'policy-to-remove',
  policyHolderId: 'policy-holder-id',
  terminated: false,
  name: 'Removable cover',
  premium: 100,
  startDate: addDays(new Date(), -30),
  endDate: addDays(new Date(), 30),
  limits: policyLimits,
  userId: testUsers.customer.id,
  userLimits: policyLimits,
  relationship: {
    ...testAuditFields,
    id: 'policy-user-id',
  },
}

async function renderDialog(
  onRequest?: (request: { policyId: string; userId: string }) => void,
) {
  server.use(
    http.delete(
      `${env.API_URL}/policies/:policyId/users/:userId`,
      ({ params }) => {
        onRequest?.({
          policyId: String(params.policyId),
          userId: String(params.userId),
        })

        return HttpResponse.json({})
      },
    ),
  )

  await renderApp(
    <UserRemovePolicyDialog user={testUsers.customer} policy={policy}>
      <button>Remove trigger</button>
    </UserRemovePolicyDialog>,
    { user: testUsers.admin },
  )

  return { user: userEvent.setup() }
}

describe('UserRemovePolicyDialog', () => {
  it('should remove the policy only after confirmation', async () => {
    const requests: { policyId: string; userId: string }[] = []
    const { user } = await renderDialog((request) => requests.push(request))

    await user.click(screen.getByRole('button', { name: 'Remove trigger' }))

    expect(requests).toHaveLength(0)

    const alertDialog = screen.getByRole('alertdialog', {
      name: 'Remove policy from user?',
    })
    expect(
      within(alertDialog).getByText(
        `This will remove ${policy.name} from ${testUsers.customer.firstName} ${testUsers.customer.lastName}. Coverage limits from this policy will no longer apply to this user.`,
      ),
    ).toBeInTheDocument()
    expect(
      within(alertDialog).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()

    await user.click(
      within(alertDialog).getByRole('button', { name: 'Remove policy' }),
    )

    await waitFor(() => {
      expect(requests).toEqual([
        { policyId: policy.id, userId: testUsers.customer.id },
      ])
    })
  })
})
