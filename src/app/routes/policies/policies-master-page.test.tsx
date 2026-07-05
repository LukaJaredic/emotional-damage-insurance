import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it, vi } from 'vitest'

import { paths } from '@/config'
import { env } from '@/config/env'
import type { PolicyDto } from '@/features/policies/types/policy-api.types'
import { premium, statusLabel } from '@/features/policies/utils/policy-labels'
import useMediaQuery from '@/hooks/use-media-query'
import { mockApiError } from '@/testing/mocks/handlers/error-response'
import { server } from '@/testing/mocks/server'
import {
  renderApp,
  selectOptions,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { Policy, UserRole } from '@/types'
import { toAppDate } from '@/utils'
import AuthGuard from '@app/auth-guard'

import PoliciesMasterPage from './policies-master-page'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

const returnedPolicies: Policy[] = [
  {
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
  },
  {
    ...testAuditFields,
    id: 'policy-2',
    policyHolderId: 'policy-holder-2',
    terminated: true,
    name: 'Premium Cover',
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

async function renderPoliciesMaster({
  isDesktop = true,
  role = 'admin',
  policies = returnedPolicies,
  status = 200,
  onPoliciesRequest,
}: {
  isDesktop?: boolean
  role?: UserRole
  policies?: Policy[]
  status?: number
  onPoliciesRequest?: (searchParams: URLSearchParams) => void
} = {}) {
  mockedUseMediaQuery.mockReturnValue(isDesktop)
  mockPoliciesResponse({ policies, status, onRequest: onPoliciesRequest })

  await renderApp(
    <VirtuosoMockContext.Provider
      value={{ viewportHeight: 800, itemHeight: 50 }}
    >
      <AuthGuard shouldHaveUser page="policy:master-page">
        <PoliciesMasterPage />
      </AuthGuard>
    </VirtuosoMockContext.Provider>,
    {
      user: testUsers[role],
      path: paths.policies.path,
      url: paths.policies.getHref(),
      additionalRoutes: [
        {
          path: paths.notFound.path,
          element: <>404</>,
        },
      ],
    },
  )

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

// Complicated assertion, but its flaky otherwise
function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s/g, ' ') ?? ''
}

function expectPremiumText(element: HTMLElement, policy: Policy) {
  expect(normalizeText(element.textContent)).toContain(
    normalizeText(premium(policy)),
  )
}

describe('PoliciesMaster', () => {
  it('should redirect customer to 404', async () => {
    await renderPoliciesMaster({ role: 'customer' })

    expect(screen.getByText('404')).toBeInTheDocument()
  })

  describe('renders', () => {
    it('should render filters', async () => {
      await renderPoliciesMaster()

      expect(searchInput()).toBeInTheDocument()
      expect(terminatedStatusSelect()).toBeInTheDocument()
      expect(startAfterInput()).toBeInTheDocument()
      expect(endBeforeInput()).toBeInTheDocument()
    })

    it('should show a table to admins and employees', async () => {
      for (const role of ['admin', 'employee'] satisfies UserRole[]) {
        cleanup()

        await renderPoliciesMaster({ role })

        expect(
          await screen.findByRole('table', { name: 'Policies table' }),
        ).toBeInTheDocument()
      }
    })

    it('should render the specified columns', async () => {
      await renderPoliciesMaster()

      expect(
        await screen.findByRole('columnheader', { name: /name/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /status/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /premium/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /start date/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /end date/i }),
      ).toBeInTheDocument()
    })

    it('should render rows that are returned', async () => {
      await renderPoliciesMaster()

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
        expect(row).toHaveTextContent(statusLabel(policy))
        expectPremiumText(row!, policy)
      }
    })

    it('should render policy cards on small screens', async () => {
      await renderPoliciesMaster({ isDesktop: false })

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

        expect(within(card).getByText(statusLabel(policy))).toBeInTheDocument()
        expect(within(card).getByText(/cover/i)).toBeInTheDocument()

        expect(
          within(card).getByText(toAppDate(policy.startDate)),
        ).toBeInTheDocument()
        expect(
          within(card).getByText(toAppDate(policy.endDate)),
        ).toBeInTheDocument()
        expectPremiumText(card, policy)
      }
    })
  })

  describe('fetch states', () => {
    it('should handle empty', async () => {
      await renderPoliciesMaster({ policies: [] })

      expect(await screen.findByText('No policies found.')).toBeInTheDocument()
    })

    it('should handle error', async () => {
      await renderPoliciesMaster({ status: 500 })

      expect(
        await screen.findByText(
          'An error occurred while loading policies. Please try again.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should request policies with selected filters', async () => {
      const requests: URLSearchParams[] = []
      const { user } = await renderPoliciesMaster({
        onPoliciesRequest: (searchParams) => {
          requests.push(new URLSearchParams(searchParams))
        },
      })

      await user.type(searchInput(), 'Premium')
      await selectOptions(terminatedStatusSelect(), ['Yes'])
      await user.type(startAfterInput(), '2026-01-01')
      await user.type(endBeforeInput(), '2027-12-31')

      await waitFor(() => {
        expect(requests.at(-1)?.get('search')).toBe('Premium')
        expect(requests.at(-1)?.get('terminated')).toBe('true')
        expect(requests.at(-1)?.get('startAfterDate')).toBe('2026-01-01')
        expect(requests.at(-1)?.get('endBeforeDate')).toBe('2027-12-31')
      })
    })

    it('should show a create button to admins and employees', async () => {
      for (const role of ['admin', 'employee'] satisfies UserRole[]) {
        cleanup()

        await renderPoliciesMaster({ role })

        expect(
          screen.getByRole('button', { name: 'Create a policy' }),
        ).toBeInTheDocument()
      }
    })

    it.todo(
      'should open a create form when the create button is clicked',
      () => {},
    )
  })
})
