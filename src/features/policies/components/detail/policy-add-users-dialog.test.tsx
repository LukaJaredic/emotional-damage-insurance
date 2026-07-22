import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { VirtuosoMockContext } from 'react-virtuoso'
import { vi } from 'vitest'

import { Button } from '@/components/ui/shadcn/button'
import { paths } from '@/config'
import { env } from '@/config/env'
import useMediaQuery from '@/hooks/use-media-query'
import { server } from '@/testing/mocks/server'
import {
  buildUser,
  renderApp,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { Policy, User } from '@/types'

import PolicyAddUsersDialog from './policy-add-users-dialog'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

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

async function renderDialog(currentUser: User = testUsers.admin) {
  mockedUseMediaQuery.mockReturnValue(true)

  const app = await renderApp(
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 800, itemHeight: 50 }}
    >
      <PolicyAddUsersDialog policy={testPolicy}>
        <Button type="button">Open add users</Button>
      </PolicyAddUsersDialog>
    </VirtuosoMockContext.Provider>,
    {
      user: currentUser,
      path: paths.policies.detail.path,
      url: paths.policies.detail.getHref(testPolicy.id),
    },
  )

  return { ...app, user: userEvent.setup() }
}

async function findFirstRowByLink(container: HTMLElement, name: string) {
  const links = await within(container).findAllByRole('link', { name })
  const row = links[0]?.closest('tr')

  expect(row).toBeInTheDocument()

  return row!
}

describe('PolicyAddUsersDialog', () => {
  it('should request candidates only after opening and render desktop dialog controls', async () => {
    const candidate = buildUser(testUsers.customer, {
      id: 'candidate-user-1',
      firstName: 'Mike',
      lastName: 'Ross',
      email: 'mike.ross@example.com',
    })
    const candidateRequests: URLSearchParams[] = []

    server.use(
      http.get(
        `${env.API_URL}/policies/:policyId/users/not-connected`,
        ({ params, request }) => {
          expect(params.policyId).toBe(testPolicy.id)
          const searchParams = new URL(request.url).searchParams
          candidateRequests.push(new URLSearchParams(searchParams))

          if (searchParams.get('page') !== '1') {
            return HttpResponse.json([])
          }

          return HttpResponse.json([candidate])
        },
      ),
    )

    const { user } = await renderDialog()

    expect(candidateRequests).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Open add users' }))

    const dialog = await screen.findByRole('dialog', {
      name: 'Add users to policy',
    })
    expect(dialog).toHaveTextContent('Search available users and connect them')
    expect(
      await within(dialog).findAllByRole('link', { name: 'Mike Ross' }),
    ).not.toHaveLength(0)

    const headers = within(dialog).getAllByRole('columnheader')
    expect(headers[0]).toHaveTextContent('Actions')
    expect(
      within(dialog).getAllByRole('button', { name: 'Close' }),
    ).toHaveLength(2)
  })

  it('should add a user refetch mutable candidates', async () => {
    const candidate = buildUser(testUsers.customer, {
      id: 'candidate-user-1',
      firstName: 'Mike',
      lastName: 'Ross',
      email: 'mike.ross@example.com',
    })
    const userRequests: URLSearchParams[] = []
    const connectRequests: unknown[] = []
    let isConnected = false

    server.use(
      http.get(
        `${env.API_URL}/policies/:policyId/users/not-connected`,
        ({ request }) => {
          const searchParams = new URL(request.url).searchParams
          userRequests.push(new URLSearchParams(searchParams))

          if (searchParams.get('page') !== '1') {
            return HttpResponse.json([])
          }

          return HttpResponse.json(isConnected ? [] : [candidate])
        },
      ),
      http.post(
        `${env.API_URL}/policies/:policyId/users`,
        async ({ request, params }) => {
          expect(params.policyId).toBe(testPolicy.id)
          connectRequests.push(await request.json())
          isConnected = true

          return HttpResponse.json({
            policyId: testPolicy.id,
            userId: candidate.id,
          })
        },
      ),
    )

    const { user } = await renderDialog()
    await user.click(screen.getByRole('button', { name: 'Open add users' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Add users to policy',
    })
    const row = await findFirstRowByLink(dialog, 'Mike Ross')
    const initialUserRequestCount = userRequests.length

    const addButton = within(row!).getByRole('button', {
      name: 'Add user to policy',
    })

    await user.click(addButton)

    await waitFor(() => {
      expect(connectRequests).toEqual([{ userId: candidate.id }])
    })
    expect(
      screen.getByRole('dialog', { name: 'Add users to policy' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(userRequests.length).toBeGreaterThan(initialUserRequestCount)
      expect(screen.queryByText('Mike Ross')).not.toBeInTheDocument()
    })
  })

  it('should send local search to users without changing the router URL search', async () => {
    const visibleUser = buildUser(testUsers.customer, {
      id: 'candidate-user-1',
      firstName: 'Mike',
      lastName: 'Ross',
      email: 'mike.ross@example.com',
    })
    const requests: URLSearchParams[] = []

    server.use(
      http.get(
        `${env.API_URL}/policies/:policyId/users/not-connected`,
        ({ request }) => {
          const searchParams = new URL(request.url).searchParams
          requests.push(new URLSearchParams(searchParams))

          if (searchParams.get('page') !== '1') {
            return HttpResponse.json([])
          }

          return HttpResponse.json(
            searchParams.get('search') === 'Mike' ? [visibleUser] : [],
          )
        },
      ),
    )

    const { router, user } = await renderDialog()
    await user.click(screen.getByRole('button', { name: 'Open add users' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Add users to policy',
    })

    await user.type(
      within(dialog).getByPlaceholderText('Search by name or email'),
      'Mike',
    )

    await waitFor(() => {
      expect(requests.at(-1)?.get('search')).toBe('Mike')
    })
    expect(router.state.location.search).toBe('')
  })

  it('should not show an add button for a user the employee cannot update', async () => {
    const manageableUser = buildUser(testUsers.customer, {
      id: 'candidate-user-1',
      firstName: 'Mike',
      lastName: 'Ross',
      email: 'mike.ross@example.com',
      roles: ['customer'],
    })
    const unmanageableUser = buildUser(testUsers.employee, {
      id: 'candidate-user-2',
      firstName: 'Harvey',
      lastName: 'Specter',
      email: 'harvey.specter@example.com',
      roles: ['employee'],
    })

    server.use(
      http.get(
        `${env.API_URL}/policies/:policyId/users/not-connected`,
        ({ request }) => {
          const searchParams = new URL(request.url).searchParams

          if (searchParams.get('page') !== '1') {
            return HttpResponse.json([])
          }

          return HttpResponse.json([manageableUser, unmanageableUser])
        },
      ),
    )

    const { user } = await renderDialog(testUsers.employee)
    await user.click(screen.getByRole('button', { name: 'Open add users' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Add users to policy',
    })
    const manageableRow = await findFirstRowByLink(dialog, 'Mike Ross')
    const unmanageableRow = await findFirstRowByLink(dialog, 'Harvey Specter')

    expect(
      within(manageableRow).getByRole('button', {
        name: 'Add user to policy',
      }),
    ).toBeInTheDocument()
    expect(
      within(unmanageableRow).queryByRole('button', {
        name: 'Add user to policy',
      }),
    ).not.toBeInTheDocument()
  })
})
