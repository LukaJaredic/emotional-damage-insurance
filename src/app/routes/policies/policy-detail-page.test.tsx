import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { VirtuosoMockContext } from 'react-virtuoso'
import { vi } from 'vitest'

import type { PolicyDto } from '@/api/policies'
import AuthGuard from '@/app/auth-guard'
import { paths } from '@/config'
import { env } from '@/config/env'
import useMediaQuery from '@/hooks/use-media-query'
import { mockApiError } from '@/testing/mocks/handlers/error-response'
import { server } from '@/testing/mocks/server'
import {
  buildUser,
  renderApp,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { Policy, PolicyHolder, User } from '@/types'
import {
  policyHolderName,
  policyPremium,
  policyStatusLabel,
  toAppDate,
  toEur,
  userRoles,
} from '@/utils'

import PolicyDetailPage from './policy-detail-page'

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

const terminatedPolicy: Policy = {
  ...testPolicy,
  id: 'terminated-policy-1',
  terminated: true,
  name: 'Terminated Cover',
}

const testPolicyHolder: PolicyHolder = {
  ...testAuditFields,
  id: testPolicy.policyHolderId,
  type: 'individual',
  firstName: 'Jane',
  lastName: 'Policyholder',
  governmentId: 'PH-123',
  email: 'jane.policyholder@example.com',
  phone: '+381 64 123 456',
}

function mockPolicyDetailResponse(policy: Policy) {
  server.use(
    http.get(`${env.API_URL}/policies/:policyId`, () =>
      HttpResponse.json(toPolicyDto(policy)),
    ),
  )
}

function mockPolicyActionResponses({
  policy,
  deleteStatus = 204,
  onTerminate,
  onReactivate,
  onDelete,
}: {
  policy: Policy
  deleteStatus?: number
  onTerminate?: (request: Request) => void
  onReactivate?: (request: Request) => void
  onDelete?: (request: Request) => void
}) {
  let currentPolicy = policy

  server.use(
    http.get(`${env.API_URL}/policies/:policyId`, () =>
      HttpResponse.json(toPolicyDto(currentPolicy)),
    ),
    http.patch(`${env.API_URL}/policies/:policyId/terminate`, ({ request }) => {
      onTerminate?.(request)
      currentPolicy = { ...currentPolicy, terminated: true }

      return HttpResponse.json(toPolicyDto(currentPolicy))
    }),
    http.patch(
      `${env.API_URL}/policies/:policyId/reactivate`,
      ({ request }) => {
        onReactivate?.(request)
        currentPolicy = { ...currentPolicy, terminated: false }

        return HttpResponse.json(toPolicyDto(currentPolicy))
      },
    ),
    http.delete(`${env.API_URL}/policies/:policyId`, ({ request }) => {
      onDelete?.(request)

      if (deleteStatus >= 400) {
        return mockApiError({ code: 'INTERNAL_ERROR', status: deleteStatus })
      }

      return new HttpResponse(null, { status: deleteStatus })
    }),
  )
}

function mockPolicyHolderDetailResponse(
  policyHolder: PolicyHolder,
  status = 200,
) {
  server.use(
    http.get(`${env.API_URL}/policy-holders/:policyHolderId`, ({ params }) => {
      expect(params.policyHolderId).toBe(policyHolder.id)

      if (status >= 400) {
        return mockApiError({ code: 'INTERNAL_ERROR', status })
      }

      return HttpResponse.json(policyHolder, { status })
    }),
  )
}

function mockPolicyUsersResponse({
  policyId = testPolicy.id,
  users = [],
  onRequest,
}: {
  policyId?: string
  users?: User[]
  onRequest?: ((searchParams: URLSearchParams) => void) | undefined
} = {}) {
  server.use(
    http.get(
      `${env.API_URL}/policies/:policyId/users`,
      ({ request, params }) => {
        expect(params.policyId).toBe(policyId)
        const searchParams = new URL(request.url).searchParams
        onRequest?.(searchParams)

        if (searchParams.get('page') !== '1') {
          return HttpResponse.json([])
        }

        return HttpResponse.json(users)
      },
    ),
  )
}

async function renderPolicyDetail({
  currentUser,
  policy,
  skipLoadingWait = false,
  skipPolicyDetailMock = false,
  policyHolderStatus = 200,
}: {
  currentUser: User
  policy: Policy
  skipLoadingWait?: boolean
  skipPolicyDetailMock?: boolean
  policyHolderStatus?: number
}) {
  mockedUseMediaQuery.mockReturnValue(true)

  if (!skipPolicyDetailMock) {
    mockPolicyDetailResponse(policy)
  }

  mockPolicyHolderDetailResponse(testPolicyHolder, policyHolderStatus)

  await renderApp(
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 800, itemHeight: 50 }}
    >
      <AuthGuard shouldHaveUser page="policy:detail-page">
        <PolicyDetailPage />
      </AuthGuard>
    </VirtuosoMockContext.Provider>,
    {
      user: currentUser,
      path: paths.policies.detail.path,
      url: paths.policies.detail.getHref(policy.id),
      additionalRoutes: [
        { path: paths.notFound.path, element: <div>404</div> },
        { path: paths.policies.path, element: <div>Policies master</div> },
      ],
    },
  )

  if (!skipLoadingWait) {
    await screen.findByRole('heading', { name: new RegExp(policy.name) })
  }

  return { user: userEvent.setup() }
}

function expectDefinition(term: string, definition: string) {
  const row = screen.getByText(term).closest('div')

  expect(row).toBeInTheDocument()
  expect(normalizeText(row!.textContent)).toContain(normalizeText(definition))
}

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s/g, ' ') ?? ''
}

function toPolicyDto(policy: Policy): PolicyDto {
  return {
    ...policy,
    startDate: policy.startDate.toISOString(),
    endDate: policy.endDate.toISOString(),
  }
}

describe('PolicyDetailPage', () => {
  describe('basic info tab', () => {
    it('should render the basic info tab by default', async () => {
      await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      expect(
        screen.getByRole('tablist', { name: 'Policy details' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Basic info' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument()
    })

    it('should render general policy details', async () => {
      await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      expect(screen.getByText('General')).toBeInTheDocument()
      expectDefinition('Status', policyStatusLabel(testPolicy))
      expectDefinition('Premium', policyPremium(testPolicy))
      expectDefinition('Start date', toAppDate(testPolicy.startDate))
      expectDefinition('End date', toAppDate(testPolicy.endDate))
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last edited')).toBeInTheDocument()
      expect(
        await screen.findByText(policyHolderName(testPolicyHolder)),
      ).toBeInTheDocument()
    })

    it('should show the policy holder ID when its lookup fails', async () => {
      await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
        policyHolderStatus: 500,
      })

      expect(
        await screen.findByText(testPolicy.policyHolderId),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: testPolicy.policyHolderId }),
      ).not.toBeInTheDocument()
    })

    it('should render policy limits', async () => {
      await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      expect(screen.getByText('Limits')).toBeInTheDocument()
      expectDefinition('Insult', toEur(testPolicy.limits.insult))
      expectDefinition('Rejection', toEur(testPolicy.limits.rejection))
      expectDefinition('Bad joke', toEur(testPolicy.limits.badJoke))
      expectDefinition('Gaslighting', toEur(testPolicy.limits.gaslighting))
      expectDefinition('Overthinking', toEur(testPolicy.limits.overthinking))
      expectDefinition(
        'Awkward silence',
        toEur(testPolicy.limits.awkwardSilence),
      )
      expectDefinition(
        "Why don't you question",
        toEur(testPolicy.limits.whyDontYouQuestion),
      )
      expectDefinition(
        'Meeting that could have been email',
        toEur(testPolicy.limits.meetingThatCouldHaveBeenEmail),
      )
    })
  })

  describe('users tab', () => {
    it('should render policy users in a table', async () => {
      const policyUsers = [
        buildUser(testUsers.customer, {
          id: 'policy-user-1',
          firstName: 'Mike',
          lastName: 'Ross',
          email: 'mike.ross@example.com',
          roles: ['customer'],
        }),
        buildUser(testUsers.employee, {
          id: 'policy-user-2',
          firstName: 'Rachel',
          lastName: 'Zane',
          email: 'rachel.zane@example.com',
          roles: ['employee', 'customer'],
        }),
      ]
      mockPolicyUsersResponse({ users: policyUsers })
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      await user.click(screen.getByRole('tab', { name: 'Users' }))

      expect(
        await screen.findByRole('table', { name: 'Policy users table' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Add users' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Remove user from policy' }),
      ).toHaveAttribute('title', 'Remove user from policy')

      const headers = screen.getAllByRole('columnheader')
      expect(headers.slice(0, 4).map((header) => header.textContent)).toEqual([
        'Actions',
        'Name',
        'Email',
        'Roles',
      ])

      for (const policyUser of policyUsers) {
        const link = await screen.findByRole('link', {
          name: `${policyUser.firstName} ${policyUser.lastName}`,
        })
        const row = link.closest('tr')

        expect(row).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          paths.users.detail.getHref(policyUser.id),
        )
        expect(within(row!).getByText(policyUser.email)).toBeInTheDocument()
        expect(
          within(row!).getByText(userRoles(policyUser.roles)),
        ).toBeInTheDocument()
      }
    })

    it('should request policy users with a search query', async () => {
      const visibleUser = buildUser(testUsers.customer, {
        id: 'filtered-policy-user',
        firstName: 'Mike',
        lastName: 'Ross',
        email: 'mike.ross@example.com',
      })
      const hiddenUser = buildUser(testUsers.customer, {
        id: 'unfiltered-policy-user',
        firstName: 'Harvey',
        lastName: 'Specter',
        email: 'harvey.specter@example.com',
      })
      const requests: URLSearchParams[] = []

      server.use(
        http.get(
          `${env.API_URL}/policies/:policyId/users`,
          ({ request, params }) => {
            expect(params.policyId).toBe(testPolicy.id)
            const searchParams = new URL(request.url).searchParams
            requests.push(new URLSearchParams(searchParams))

            if (searchParams.get('page') !== '1') {
              return HttpResponse.json([])
            }

            if (searchParams.get('search') === 'Mike') {
              return HttpResponse.json([visibleUser])
            }

            return HttpResponse.json([hiddenUser, visibleUser])
          },
        ),
      )
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      await user.click(screen.getByRole('tab', { name: 'Users' }))
      await screen.findByText('Harvey Specter')
      await user.type(
        screen.getByPlaceholderText('Search by name or email'),
        'Mike',
      )

      await waitFor(() => {
        expect(requests.at(-1)?.get('search')).toBe('Mike')
      })

      expect(
        requests.some(
          (request) => request.get('search') === 'Mike' && request.has('page'),
        ),
      ).toBe(true)
      expect(await screen.findByText('Mike Ross')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.queryByText('Harvey Specter')).not.toBeInTheDocument()
      })
    })

    it('should show remove only for employee-manageable user rows', async () => {
      const manageableUser = buildUser(testUsers.customer, {
        id: 'policy-user-1',
        firstName: 'Mike',
        lastName: 'Ross',
        email: 'mike.ross@example.com',
        roles: ['customer'],
      })
      const mixedUser = buildUser(testUsers.customer, {
        id: 'policy-user-2',
        firstName: 'Rachel',
        lastName: 'Zane',
        email: 'rachel.zane@example.com',
        roles: ['employee', 'customer'],
      })
      const employeeUser = buildUser(testUsers.employee, {
        id: 'policy-user-3',
        firstName: 'Harvey',
        lastName: 'Specter',
        email: 'harvey.specter@example.com',
        roles: ['employee'],
      })
      mockPolicyUsersResponse({
        users: [manageableUser, mixedUser, employeeUser],
      })
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      await user.click(screen.getByRole('tab', { name: 'Users' }))

      const manageableRow = (await screen.findByText('Mike Ross')).closest('tr')
      const mixedRow = (await screen.findByText('Rachel Zane')).closest('tr')
      const employeeRow = (await screen.findByText('Harvey Specter')).closest(
        'tr',
      )

      expect(manageableRow).toBeInTheDocument()
      expect(mixedRow).toBeInTheDocument()
      expect(employeeRow).toBeInTheDocument()
      expect(
        within(manageableRow!).getByRole('button', {
          name: 'Remove user from policy',
        }),
      ).toHaveAttribute('title', 'Remove user from policy')
      expect(
        within(mixedRow!).queryByRole('button', {
          name: 'Remove user from policy',
        }),
      ).not.toBeInTheDocument()
      expect(
        within(employeeRow!).queryByRole('button', {
          name: 'Remove user from policy',
        }),
      ).not.toBeInTheDocument()
    })
  })

  describe('permissions', () => {
    it("should not let customer see policy's details", async () => {
      await renderPolicyDetail({
        currentUser: testUsers.customer,
        policy: testPolicy,
        skipLoadingWait: true,
      })

      expect(await screen.findByText('404')).toBeInTheDocument()
    })

    it('should let admin and employee terminate policies', async () => {
      for (const user of [testUsers.admin, testUsers.employee]) {
        cleanup()
        await renderPolicyDetail({ currentUser: user, policy: testPolicy })

        expect(
          screen.getByRole('button', { name: /terminate policy/i }),
        ).toBeInTheDocument()
      }
    })

    it('should let admin and employee reactivate policies', async () => {
      for (const user of [testUsers.admin, testUsers.employee]) {
        cleanup()
        await renderPolicyDetail({
          currentUser: user,
          policy: terminatedPolicy,
        })

        expect(
          screen.getByRole('button', { name: /reactivate policy/i }),
        ).toBeInTheDocument()
      }
    })

    it('should let admin delete policies', async () => {
      await renderPolicyDetail({
        currentUser: testUsers.admin,
        policy: testPolicy,
      })

      expect(
        screen.getByRole('button', { name: /delete policy/i }),
      ).toBeInTheDocument()
    })

    it('should not let employee delete policies', async () => {
      await renderPolicyDetail({
        currentUser: testUsers.employee,
        policy: testPolicy,
      })

      expect(
        screen.queryByRole('button', { name: /delete policy/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should confirm and terminate a policy', async () => {
      const requests: Request[] = []
      mockPolicyActionResponses({
        policy: testPolicy,
        onTerminate: (request) => requests.push(request),
      })
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.admin,
        policy: testPolicy,
        skipPolicyDetailMock: true,
      })

      await user.click(
        screen.getByRole('button', { name: /terminate policy/i }),
      )

      const dialog = screen.getByRole('alertdialog', {
        name: /terminate standard cover/i,
      })
      expect(dialog).toHaveTextContent(
        'The policy will no longer be active until it is reactivated.',
      )

      await user.click(
        within(dialog).getByRole('button', { name: 'Terminate policy' }),
      )

      await waitFor(() => {
        expect(requests).toHaveLength(1)
      })
      expect(requests[0]!.method).toBe('PATCH')
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
      expect(
        await screen.findByRole('button', { name: /reactivate policy/i }),
      ).toBeInTheDocument()
    })

    it('should confirm and reactivate a policy', async () => {
      const requests: Request[] = []
      mockPolicyActionResponses({
        policy: terminatedPolicy,
        onReactivate: (request) => requests.push(request),
      })
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.admin,
        policy: terminatedPolicy,
        skipPolicyDetailMock: true,
      })

      await user.click(
        screen.getByRole('button', { name: /reactivate policy/i }),
      )

      const dialog = screen.getByRole('alertdialog', {
        name: /reactivate terminated cover/i,
      })
      expect(dialog).toHaveTextContent('Terminated Cover')
      expect(dialog).toHaveTextContent(
        'Reactivate this policy to make it active again',
      )

      await user.click(
        within(dialog).getByRole('button', { name: 'Reactivate policy' }),
      )

      await waitFor(() => {
        expect(requests).toHaveLength(1)
      })
      expect(requests[0]!.method).toBe('PATCH')
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
      expect(
        await screen.findByRole('button', { name: /terminate policy/i }),
      ).toBeInTheDocument()
    })

    it('should confirm, delete a policy, and redirect to policies master', async () => {
      const requests: Request[] = []
      mockPolicyActionResponses({
        policy: testPolicy,
        onDelete: (request) => requests.push(request),
      })
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.admin,
        policy: testPolicy,
        skipPolicyDetailMock: true,
      })

      await user.click(screen.getByRole('button', { name: /delete policy/i }))

      const dialog = screen.getByRole('alertdialog', {
        name: /delete standard cover/i,
      })
      expect(dialog).toHaveTextContent('Standard Cover')
      expect(dialog).toHaveTextContent('This action cannot be undone.')

      await user.click(
        within(dialog).getByRole('button', { name: 'Delete policy' }),
      )

      await waitFor(() => {
        expect(requests).toHaveLength(1)
      })
      expect(requests[0]!.method).toBe('DELETE')
      expect(await screen.findByText('Policies master')).toBeInTheDocument()
    })

    it('should keep the delete dialog open when deletion fails', async () => {
      const requests: Request[] = []
      mockPolicyActionResponses({
        policy: testPolicy,
        deleteStatus: 500,
        onDelete: (request) => requests.push(request),
      })
      const { user } = await renderPolicyDetail({
        currentUser: testUsers.admin,
        policy: testPolicy,
        skipPolicyDetailMock: true,
      })

      await user.click(screen.getByRole('button', { name: /delete policy/i }))
      const dialog = screen.getByRole('alertdialog', {
        name: /delete standard cover/i,
      })

      await user.click(
        within(dialog).getByRole('button', { name: 'Delete policy' }),
      )

      await waitFor(() => {
        expect(requests).toHaveLength(1)
        expect(
          within(dialog).getByRole('button', { name: 'Delete policy' }),
        ).toBeEnabled()
      })
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })
  })
})
