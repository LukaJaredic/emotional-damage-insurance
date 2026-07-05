import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import AuthGuard from '@/app/auth-guard'
import { paths } from '@/config'
import { env } from '@/config/env'
import type { PolicyDto } from '@/features/policies/types/policy-api.types'
import { premium, statusLabel } from '@/features/policies/utils/policy-labels'
import { server } from '@/testing/mocks/server'
import { renderApp, testAuditFields, testUsers } from '@/testing/test-utils'
import type { Policy, User } from '@/types'
import { toAppDate, toEur } from '@/utils'

import PolicyDetailPage from './policy-detail-page'

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

function mockPolicyDetailResponse(policy: Policy) {
  server.use(
    http.get(`${env.API_URL}/policies/:policyId`, () =>
      HttpResponse.json(toPolicyDto(policy)),
    ),
  )
}

async function renderPolicyDetail(
  currentUser: User,
  policy: Policy,
  skipLoadingWait = false,
) {
  mockPolicyDetailResponse(policy)

  await renderApp(
    <AuthGuard shouldHaveUser page="policy:detail-page">
      <PolicyDetailPage />
    </AuthGuard>,
    {
      user: currentUser,
      path: paths.policies.detail.path,
      url: paths.policies.detail.getHref(policy.id),
      additionalRoutes: [
        { path: paths.notFound.path, element: <div>404</div> },
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
  describe('renders', () => {
    it('should render general policy details', async () => {
      await renderPolicyDetail(testUsers.employee, testPolicy)

      expect(screen.getByText('General')).toBeInTheDocument()
      expectDefinition('Status', statusLabel(testPolicy))
      expectDefinition('Premium', premium(testPolicy))
      expectDefinition('Start date', toAppDate(testPolicy.startDate))
      expectDefinition('End date', toAppDate(testPolicy.endDate))
      expectDefinition('Policy holder ID', testPolicy.policyHolderId)
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last edited')).toBeInTheDocument()
    })

    it('should render policy limits', async () => {
      await renderPolicyDetail(testUsers.employee, testPolicy)

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

  describe('permissions', () => {
    it("should not let customer see policy's details", async () => {
      await renderPolicyDetail(testUsers.customer, testPolicy, true)

      expect(await screen.findByText('404')).toBeInTheDocument()
    })

    it('should let admin and employee terminate policies', async () => {
      for (const user of [testUsers.admin, testUsers.employee]) {
        cleanup()
        await renderPolicyDetail(user, testPolicy)

        expect(
          screen.getByRole('button', { name: /terminate policy/i }),
        ).toBeInTheDocument()
      }
    })

    it('should let admin and employee reactivate policies', async () => {
      for (const user of [testUsers.admin, testUsers.employee]) {
        cleanup()
        await renderPolicyDetail(user, terminatedPolicy)

        expect(
          screen.getByRole('button', { name: /reactivate policy/i }),
        ).toBeInTheDocument()
      }
    })

    it('should let admin delete policies', async () => {
      await renderPolicyDetail(testUsers.admin, testPolicy)

      expect(
        screen.getByRole('button', { name: /delete policy/i }),
      ).toBeInTheDocument()
    })

    it('should not let employee delete policies', async () => {
      await renderPolicyDetail(testUsers.employee, testPolicy)

      expect(
        screen.queryByRole('button', { name: /delete policy/i }),
      ).not.toBeInTheDocument()
    })
  })
})
