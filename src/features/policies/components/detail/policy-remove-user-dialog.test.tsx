import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { Button } from '@/components/ui/shadcn/button'
import { paths } from '@/config'
import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import {
  buildUser,
  renderApp,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { Policy } from '@/types'

import PolicyRemoveUserDialog from './policy-remove-user-dialog'

const testPolicy: Policy = {
  ...testAuditFields,
  id: 'policy-1',
  policyHolderId: 'policy-holder-1',
  terminated: false,
  name: 'Standard Cover',
  premium: 1200,
  startDate: new Date('2026-02-01'),
  endDate: new Date('2027-02-01'),
  limits: {
    insult: 1000,
    rejection: 2000,
    badJoke: 3000,
    gaslighting: 4000,
    overthinking: 5000,
    awkwardSilence: 6000,
    whyDontYouQuestion: 7000,
    meetingThatCouldHaveBeenEmail: 8000,
  },
}

const testUser = buildUser(testUsers.customer, {
  id: 'policy-user-1',
  firstName: 'Mike',
  lastName: 'Ross',
  email: 'mike.ross@example.com',
})

describe('PolicyRemoveUserDialog', () => {
  it('should confirm before sending policy and user route params', async () => {
    const deleteRequests: Array<{ policyId: string; userId: string }> = []

    server.use(
      http.delete(
        `${env.API_URL}/policies/:policyId/users/:userId`,
        ({ params }) => {
          deleteRequests.push({
            policyId: String(params.policyId),
            userId: String(params.userId),
          })

          return new HttpResponse(null, { status: 204 })
        },
      ),
    )

    await renderApp(
      <PolicyRemoveUserDialog policy={testPolicy} user={testUser}>
        <Button type="button">Open remove user</Button>
      </PolicyRemoveUserDialog>,
      {
        user: testUsers.admin,
        path: paths.policies.detail.path,
        url: paths.policies.detail.getHref(testPolicy.id),
      },
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Open remove user' }))

    expect(deleteRequests).toHaveLength(0)
    const dialog = screen.getByRole('alertdialog', {
      name: 'Remove user from policy?',
    })
    expect(dialog).toHaveTextContent(
      'This will remove Mike Ross from Standard Cover. Coverage limits from this policy will no longer apply to this user.',
    )

    await user.click(
      within(dialog).getByRole('button', { name: 'Remove user' }),
    )

    await waitFor(() => {
      expect(deleteRequests).toEqual([
        { policyId: testPolicy.id, userId: testUser.id },
      ])
    })
  })
})
