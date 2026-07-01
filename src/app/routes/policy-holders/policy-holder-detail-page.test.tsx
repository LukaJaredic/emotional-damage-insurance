import { screen, within } from '@testing-library/dom'
import { cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import AuthGuard from '@/app/auth-guard'
import { paths } from '@/config'
import { env } from '@/config/env'
import {
  name,
  typeLabels,
} from '@/features/policy-holders/utils/policy-holder-labels'
import { server } from '@/testing/mocks/server'
import { renderApp, testAuditFields, testUsers } from '@/testing/test-utils'
import type { PolicyHolder, PolicyHolderType, User } from '@/types'

import PolicyHolderDetailPage from './policy-holder-detail-page'

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

function mockPolicyHolderDetailResponse(policyHolder: PolicyHolder) {
  server.use(
    http.get(`${env.API_URL}/policy-holders/:policyHolderId`, () =>
      HttpResponse.json(policyHolder),
    ),
  )
}

async function renderPolicyHolderDetail(
  currentUser: User,
  viewedPolicyHolder: PolicyHolder,
  skipLoadingWait = false,
) {
  mockPolicyHolderDetailResponse(viewedPolicyHolder)

  await renderApp(
    <AuthGuard shouldHaveUser page="policy-holders:detail-page">
      <PolicyHolderDetailPage />
    </AuthGuard>,
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
      name: name(viewedPolicyHolder),
    })
  }

  return { user: userEvent.setup() }
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
  describe('renders', () => {
    it("should render individual holder's details", async () => {
      const ph = testPolicyHolders.individual
      await renderPolicyHolderDetail(testUsers.employee, ph)

      if (ph.type !== 'individual') {
        throw new Error('Unexpected policy holder type, expected individual')
      }

      expectDefinition('Type', typeLabels[ph.type])
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
      await renderPolicyHolderDetail(testUsers.admin, ph)

      if (ph.type !== 'business') {
        throw new Error('Unexpected policy holder type, expected business')
      }

      expectDefinition('Type', typeLabels[ph.type])
      expectDefinition('Business name', ph.businessName)
      expectDefinition('Tax ID', ph.governmentId)
      expectDefinitionLink('Email', ph.email)
      expectDefinitionLink('Phone', ph.phone)
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last edited')).toBeInTheDocument()
    })
  })

  describe('permissions', () => {
    it("should not let customer see policy holder's details", async () => {
      await renderPolicyHolderDetail(
        testUsers.customer,
        testPolicyHolders.individual,
        true,
      )

      expect(await screen.findByText('404')).toBeInTheDocument()
    })

    it('should let admin and employee edit policy holders', async () => {
      for (const user of [testUsers.admin, testUsers.employee]) {
        cleanup()
        await renderPolicyHolderDetail(user, testPolicyHolders.individual)

        expect(
          screen.getByRole('button', { name: /edit/i }),
        ).toBeInTheDocument()
      }
    })

    it('should let admin delete policy holders', async () => {
      await renderPolicyHolderDetail(
        testUsers.admin,
        testPolicyHolders.individual,
      )

      expect(
        screen.queryByRole('button', { name: /delete/i }),
      ).toBeInTheDocument()
    })

    it('should not let employee delete policy holders', async () => {
      await renderPolicyHolderDetail(
        testUsers.employee,
        testPolicyHolders.individual,
      )

      expect(
        screen.queryByRole('button', { name: /delete/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe.todo('actions', () => {
    it('should open edit dialog when edit button is clicked', async () => {})

    it('should open a delete alert when delete button is clicked', async () => {})
  })
})
