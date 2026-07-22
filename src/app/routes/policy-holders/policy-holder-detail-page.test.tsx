import { screen, waitFor, within } from '@testing-library/dom'
import { cleanup } from '@testing-library/react'
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
  renderApp,
  selectOptions,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { Policy, PolicyHolder, PolicyHolderType, User } from '@/types'
import {
  policyHolderName,
  policyHolderTypeLabels,
  policyPremium,
  policyStatusLabel,
  toAppDate,
} from '@/utils'

import PolicyHolderDetailPage from './policy-holder-detail-page'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

const testPolicyHolders: Record<PolicyHolderType, PolicyHolder> = {
  individual: {
    ...testAuditFields,
    id: 'individual-policy-holder-id',
    type: 'individual',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    governmentId: '1234567891234',
    phone: '+38269123123',
  },
  business: {
    ...testAuditFields,
    id: 'business-policy-holder-id',
    type: 'business',
    businessName: 'Acme Corp',
    email: 'contact@acmecorp.com',
    governmentId: '12345678',
    phone: '+38269123123',
  },
}

const returnedPolicies: Policy[] = [
  {
    ...testAuditFields,
    id: 'viewed-holder-active-policy-id',
    policyHolderId: testPolicyHolders.individual.id,
    terminated: false,
    name: 'Personal Liability Cover',
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
  },
  {
    ...testAuditFields,
    id: 'viewed-holder-terminated-policy-id',
    policyHolderId: testPolicyHolders.individual.id,
    terminated: true,
    name: 'Family Protection Cover',
    premium: 3400,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2027-03-01'),
    limits: {
      insult: 1500,
      rejection: 2500,
      badJoke: 3500,
      gaslighting: 4500,
      overthinking: 5500,
      awkwardSilence: 6500,
      whyDontYouQuestion: 7500,
      meetingThatCouldHaveBeenEmail: 8500,
    },
  },
]

function mockPolicyHolderDetailResponse(policyHolder: PolicyHolder) {
  server.use(
    http.get(`${env.API_URL}/policy-holders/:policyHolderId`, () =>
      HttpResponse.json(policyHolder),
    ),
  )
}

function mockPoliciesResponse({
  policies = returnedPolicies,
  status = 200,
  onRequest,
}: {
  policies?: Policy[]
  status?: number
  onRequest?: ((searchParams: URLSearchParams) => void) | undefined
} = {}) {
  server.use(
    http.get(`${env.API_URL}/policies`, ({ request }) => {
      onRequest?.(new URL(request.url).searchParams)

      if (status >= 400) {
        return mockApiError({ code: 'INTERNAL_ERROR', status })
      }

      return HttpResponse.json(policies.map(toPolicyDto), { status })
    }),
  )
}

function toPolicyDto(policy: Policy): PolicyDto {
  return {
    ...policy,
    startDate: policy.startDate.toISOString(),
    endDate: policy.endDate.toISOString(),
  }
}

type RenderPolicyHolderDetailOptions = {
  currentUser: User
  viewedPolicyHolder: PolicyHolder
  skipLoadingWait?: boolean
  isDesktop?: boolean
  policies?: Policy[]
  policiesStatus?: number
  onPoliciesRequest?: (searchParams: URLSearchParams) => void
}

async function renderPolicyHolderDetail({
  currentUser,
  viewedPolicyHolder,
  skipLoadingWait = false,
  isDesktop = true,
  policies = returnedPolicies,
  policiesStatus = 200,
  onPoliciesRequest,
}: RenderPolicyHolderDetailOptions) {
  mockedUseMediaQuery.mockReturnValue(isDesktop)
  mockPolicyHolderDetailResponse(viewedPolicyHolder)
  mockPoliciesResponse({
    policies,
    status: policiesStatus,
    onRequest: onPoliciesRequest,
  })

  await renderApp(
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 800, itemHeight: 50 }}
    >
      <AuthGuard shouldHaveUser page="policy-holder:detail-page">
        <PolicyHolderDetailPage />
      </AuthGuard>
    </VirtuosoMockContext.Provider>,
    {
      user: currentUser,
      path: paths.policyHolders.detail.path,
      url: paths.policyHolders.detail.getHref(viewedPolicyHolder.id),
      additionalRoutes: [
        { path: paths.notFound.path, element: <div>404</div> },
      ],
    },
  )

  if (!skipLoadingWait) {
    await screen.findByRole('heading', {
      name: policyHolderName(viewedPolicyHolder),
    })
  }

  return { user: userEvent.setup() }
}

function searchInput() {
  return screen.getByPlaceholderText('Search by policy name')
}

function terminatedStatusSelect() {
  return screen.getByRole('combobox')
}

function startAfterInput() {
  return screen.getByLabelText('Starts after')
}

function endBeforeInput() {
  return screen.getByLabelText('Ends before')
}

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s/g, ' ') ?? ''
}

function expectPremiumText(element: HTMLElement, policy: Policy) {
  expect(normalizeText(element.textContent)).toContain(
    normalizeText(policyPremium(policy)),
  )
}

async function openPoliciesTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('tab', { name: 'Policies' }))
}

function expectDefinition(term: string, definition: string) {
  const row = screen.getByText(term).closest('div')

  expect(row).toBeInTheDocument()
  expect(within(row!).getByText(definition)).toBeInTheDocument()
}

function expectDefinitionLink(term: string, name: string) {
  const row = screen.getByText(term).closest('div')

  expect(row).toBeInTheDocument()
  expect(within(row!).getByRole('link', { name })).toBeInTheDocument()
}

describe('PolicyHolderDetailPage', () => {
  describe('basic info tab', () => {
    it("should render individual holder's details", async () => {
      const ph = testPolicyHolders.individual
      await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: ph,
      })

      if (ph.type !== 'individual') {
        throw new Error('Unexpected policy holder type, expected individual')
      }

      expectDefinition('Type', policyHolderTypeLabels[ph.type])
      expectDefinition('First name', ph.firstName)
      expectDefinition('Last name', ph.lastName)
      expectDefinition('Government ID', ph.governmentId)
      expectDefinitionLink('Email', ph.email)
      expectDefinitionLink('Phone', ph.phone)
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last edited')).toBeInTheDocument()
    })

    it("should render business holder's details", async () => {
      const ph = testPolicyHolders.business
      await renderPolicyHolderDetail({
        currentUser: testUsers.admin,
        viewedPolicyHolder: ph,
      })

      if (ph.type !== 'business') {
        throw new Error('Unexpected policy holder type, expected business')
      }

      expectDefinition('Type', policyHolderTypeLabels[ph.type])
      expectDefinition('Business name', ph.businessName)
      expectDefinition('Tax ID', ph.governmentId)
      expectDefinitionLink('Email', ph.email)
      expectDefinitionLink('Phone', ph.phone)
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last edited')).toBeInTheDocument()
    })

    it('should render the basic info tab by default', async () => {
      const ph = testPolicyHolders.individual
      await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: ph,
      })

      if (ph.type !== 'individual') {
        throw new Error('Unexpected policy holder type, expected individual')
      }

      expect(
        screen.getByRole('tablist', { name: 'Policy holder details' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Basic info' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('tab', { name: 'Policies' })).toBeInTheDocument()
      expectDefinition('First name', ph.firstName)
    })
  })

  describe('policies tab', () => {
    it('should render policy holder policies in a desktop table', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      await openPoliciesTab(user)

      expect(
        await screen.findByRole('table', { name: 'Policies table' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Add policy' }),
      ).toBeInTheDocument()
    })

    it('should create a policy for the viewed policy holder by default', async () => {
      const requests: Record<string, unknown>[] = []
      const viewedPolicyHolder = testPolicyHolders.individual
      server.use(
        http.post(`${env.API_URL}/policies`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          requests.push(body)
          return HttpResponse.json({ status: 201 })
        }),
      )
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder,
      })

      await openPoliciesTab(user)
      await user.click(screen.getByRole('button', { name: 'Add policy' }))

      const dialog = await screen.findByRole('dialog', {
        name: 'Create a policy',
      })

      expect(
        within(dialog).queryByLabelText('Policy holder'),
      ).not.toBeInTheDocument()

      await user.type(within(dialog).getByLabelText('Name'), 'Defaulted cover')
      await user.type(within(dialog).getByLabelText('Premium'), '450')
      await user.click(
        within(dialog).getByRole('button', { name: 'Create policy' }),
      )

      await waitFor(() => {
        expect(requests).toEqual([
          expect.objectContaining({
            policyHolderId: viewedPolicyHolder.id,
          }),
        ])
      })
    })

    it('should render the exact shared policy columns', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      await openPoliciesTab(user)

      expect(
        (await screen.findAllByRole('columnheader')).map((header) =>
          normalizeText(header.textContent),
        ),
      ).toEqual(['Name', 'Status', 'Premium', 'Start date', 'End date'])
    })

    it('should render policy row links, status, premium, and dates', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      await openPoliciesTab(user)

      for (const policy of returnedPolicies) {
        const link = (
          await screen.findAllByRole('link', { name: policy.name })
        )[0]!
        const row = link.closest('tr')

        expect(row).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          paths.policies.detail.getHref(policy.id),
        )
        expect(row).toHaveTextContent(policyStatusLabel(policy))
        expectPremiumText(row!, policy)
        expect(
          within(row!).getByText(toAppDate(policy.startDate)),
        ).toBeInTheDocument()
        expect(
          within(row!).getByText(toAppDate(policy.endDate)),
        ).toBeInTheDocument()
      }
    })

    it('should render policy cards on mobile', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
        isDesktop: false,
      })

      await openPoliciesTab(user)

      expect(await screen.findByRole('list')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()

      for (const policy of returnedPolicies) {
        const card = screen.getAllByRole('link', {
          name: new RegExp(policy.name, 'i'),
        })[0]!

        expect(card).toHaveAttribute(
          'href',
          paths.policies.detail.getHref(policy.id),
        )
        expect(
          within(card).getByText(policyStatusLabel(policy)),
        ).toBeInTheDocument()
        expect(
          within(card).getByText(toAppDate(policy.startDate)),
        ).toBeInTheDocument()
        expect(
          within(card).getByText(toAppDate(policy.endDate)),
        ).toBeInTheDocument()
        expectPremiumText(card, policy)
      }
    })

    it('should handle empty policies', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
        policies: [],
      })

      await openPoliciesTab(user)

      expect(
        await screen.findByText('No policies found for this policy holder.'),
      ).toBeInTheDocument()
    })

    it('should handle policy errors', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
        policiesStatus: 500,
      })

      await openPoliciesTab(user)

      expect(
        await screen.findByText(
          'An error occurred while loading policies. Please try again.',
        ),
      ).toBeInTheDocument()
    })

    it('should request policies for the viewed policy holder', async () => {
      const requests: URLSearchParams[] = []
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
        onPoliciesRequest: (searchParams) => {
          requests.push(new URLSearchParams(searchParams))
        },
      })

      await openPoliciesTab(user)

      await waitFor(() => {
        expect(requests.at(-1)?.get('policyHolderId')).toBe(
          testPolicyHolders.individual.id,
        )
      })
    })

    it('should request policies with filters while retaining policyHolderId', async () => {
      const requests: URLSearchParams[] = []
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
        onPoliciesRequest: (searchParams) => {
          requests.push(new URLSearchParams(searchParams))
        },
      })

      await openPoliciesTab(user)
      await user.type(searchInput(), 'Family')
      await selectOptions(terminatedStatusSelect(), ['Yes'])
      await user.type(startAfterInput(), '2026-01-01')
      await user.type(endBeforeInput(), '2027-12-31')

      await waitFor(() => {
        const latestRequest = requests.at(-1)

        expect(latestRequest?.get('policyHolderId')).toBe(
          testPolicyHolders.individual.id,
        )
        expect(latestRequest?.get('search')).toBe('Family')
        expect(latestRequest?.get('terminated')).toBe('true')
        expect(latestRequest?.get('startAfterDate')).toBe('2026-01-01')
        expect(latestRequest?.get('endBeforeDate')).toBe('2027-12-31')
      })
    })
  })

  describe('permissions', () => {
    it("should not let customer see policy holder's details", async () => {
      await renderPolicyHolderDetail({
        currentUser: testUsers.customer,
        viewedPolicyHolder: testPolicyHolders.individual,
        skipLoadingWait: true,
      })

      expect(await screen.findByText('404')).toBeInTheDocument()
    })

    it('should let admin and employee edit policy holders', async () => {
      for (const user of [testUsers.admin, testUsers.employee]) {
        cleanup()
        await renderPolicyHolderDetail({
          currentUser: user,
          viewedPolicyHolder: testPolicyHolders.individual,
        })

        expect(
          screen.getByRole('button', { name: /edit/i }),
        ).toBeInTheDocument()
      }
    })

    it('should let admin delete policy holders', async () => {
      await renderPolicyHolderDetail({
        currentUser: testUsers.admin,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      expect(
        screen.queryByRole('button', { name: /delete/i }),
      ).toBeInTheDocument()
    })

    it('should not let employee delete policy holders', async () => {
      await renderPolicyHolderDetail({
        currentUser: testUsers.employee,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      expect(
        screen.queryByRole('button', { name: /delete/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.admin,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should open a delete alert when delete button is clicked', async () => {
      const { user } = await renderPolicyHolderDetail({
        currentUser: testUsers.admin,
        viewedPolicyHolder: testPolicyHolders.individual,
      })

      await user.click(screen.getByRole('button', { name: /delete/i }))

      const alertDialog = screen.getByRole('alertdialog')

      expect(alertDialog).toBeInTheDocument()
      expect(within(alertDialog).getByText(/are you sure/i)).toBeInTheDocument()
    })
  })
})
