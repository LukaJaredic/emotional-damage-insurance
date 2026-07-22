import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { addDays } from 'date-fns'
import { delay, HttpResponse, http } from 'msw'

import AuthGuard from '@/app/auth-guard'
import { paths } from '@/config'
import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import {
  buildUser,
  renderApp,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { PolicyLimits, PolicyWithUserLimits, User } from '@/types'
import { policyStatusLabel, userRoles } from '@/utils'

import UserDetailPage from './user-detail-page'

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

const userLimits: PolicyLimits = {
  insult: 500,
  rejection: 1_000,
  badJoke: 1_500,
  gaslighting: 2_000,
  overthinking: 2_500,
  awkwardSilence: 3_000,
  whyDontYouQuestion: 3_500,
  meetingThatCouldHaveBeenEmail: 4_000,
}

function buildPolicyWithUserLimits(
  overrides: Partial<PolicyWithUserLimits> = {},
): PolicyWithUserLimits {
  return {
    ...testAuditFields,
    id: 'active-policy',
    policyHolderId: 'policy-holder-id',
    terminated: false,
    name: 'Active cover',
    premium: 100,
    startDate: addDays(new Date(), -30),
    endDate: addDays(new Date(), 30),
    limits: policyLimits,
    userId: testUsers.customer.id,
    userLimits,
    relationship: {
      ...testAuditFields,
      id: 'active-relationship',
    },
    ...overrides,
  }
}

function mockUserDetailResponse(user: User) {
  server.use(
    http.get(`${env.API_URL}/users/:userId`, () => HttpResponse.json(user)),
  )
}

function mockUserLimitsResponse(policies: PolicyWithUserLimits[]) {
  server.use(
    http.get(`${env.API_URL}/users/:userId/limits`, () =>
      HttpResponse.json(policies),
    ),
  )
}

async function renderUserDetail(currentUser: User, viewedUser?: User) {
  const userToView = viewedUser ?? currentUser
  mockUserDetailResponse(userToView)

  await renderApp(
    <AuthGuard shouldHaveUser page="user:detail-page">
      <UserDetailPage />
    </AuthGuard>,
    {
      user: currentUser,
      path: paths.users.detail.path,
      url: paths.users.detail.getHref(userToView.id),
    },
  )

  await screen.findByRole('heading', {
    name: `${userToView.firstName} ${userToView.lastName}`,
  })

  return { user: userEvent.setup() }
}

async function openPoliciesTab(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('tab', { name: 'Policies' }))
}

describe('UserDetailPage', () => {
  describe('basic info tab', () => {
    it('should render the basic info tab by default', async () => {
      const user = testUsers.admin
      await renderUserDetail(user)

      expect(
        screen.getByRole('tablist', { name: 'User details' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Basic info' })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(screen.getByRole('tab', { name: 'Policies' })).toBeInTheDocument()
    })

    it("should render user's details", async () => {
      const user = testUsers.employee
      await renderUserDetail(user)

      expect(screen.getAllByText(userRoles(user.roles)).length).toBeGreaterThan(
        0,
      )
      expect(screen.getByText(user.firstName)).toBeInTheDocument()
      expect(screen.getByText(user.lastName)).toBeInTheDocument()

      expect(
        screen.getAllByRole('link', { name: user.email }).length,
      ).toBeGreaterThan(0)
      expect(screen.getByText('Created')).toBeInTheDocument()
      expect(screen.getByText('Last edited')).toBeInTheDocument()
    })
  })

  describe('policies tab', () => {
    it('should render policies newest first and select the newest active policy', async () => {
      const now = new Date()
      const activePolicy = buildPolicyWithUserLimits()
      const futurePolicy = buildPolicyWithUserLimits({
        id: 'future-policy',
        name: 'Future cover',
        startDate: addDays(now, 60),
        endDate: addDays(now, 120),
        relationship: {
          ...testAuditFields,
          id: 'future-relationship',
        },
      })
      const expiredPolicy = buildPolicyWithUserLimits({
        id: 'expired-policy',
        name: 'Expired cover',
        startDate: addDays(now, -120),
        endDate: addDays(now, -60),
        relationship: {
          ...testAuditFields,
          id: 'expired-relationship',
        },
      })

      mockUserLimitsResponse([expiredPolicy, activePolicy, futurePolicy])
      const { user } = await renderUserDetail(testUsers.customer)

      await openPoliciesTab(user)

      const policyTabs = await screen.findByRole('tablist', {
        name: 'User policies',
      })
      expect(
        within(policyTabs)
          .getAllByRole('tab')
          .map((tab) => tab.textContent),
      ).toEqual(['Future cover', 'Active cover', 'Expired cover'])
      expect(
        within(policyTabs).getByRole('tab', { name: 'Active cover' }),
      ).toHaveAttribute('aria-selected', 'true')
      expect(
        screen.getByText(policyStatusLabel(activePolicy)),
      ).toBeInTheDocument()
    })

    it('should select the newest policy when none are active', async () => {
      const now = new Date()
      const olderPolicy = buildPolicyWithUserLimits({
        id: 'older-policy',
        name: 'Older cover',
        startDate: addDays(now, -120),
        endDate: addDays(now, -90),
      })
      const newerPolicy = buildPolicyWithUserLimits({
        id: 'newer-policy',
        name: 'Newer cover',
        startDate: addDays(now, -60),
        endDate: addDays(now, -30),
      })
      mockUserLimitsResponse([olderPolicy, newerPolicy])
      const { user } = await renderUserDetail(testUsers.admin)

      await openPoliciesTab(user)

      expect(
        await screen.findByRole('tab', { name: 'Newer cover' }),
      ).toHaveAttribute('aria-selected', 'true')
    })

    it('should clamp progress values and handle zero totals', async () => {
      const policy = buildPolicyWithUserLimits({
        limits: {
          ...policyLimits,
          rejection: 100,
          badJoke: 0,
        },
        userLimits: {
          ...userLimits,
          rejection: 200,
          badJoke: 100,
          gaslighting: -100,
        },
      })
      mockUserLimitsResponse([policy])
      const { user } = await renderUserDetail(testUsers.admin)

      await openPoliciesTab(user)

      expect(
        screen.getByRole('button', { name: 'Add policy' }),
      ).toBeInTheDocument()

      expect(
        await screen.findByRole('progressbar', { name: 'Rejection remaining' }),
      ).toHaveAttribute('aria-valuenow', '100')
      expect(
        screen.getByRole('progressbar', { name: 'Bad joke remaining' }),
      ).toHaveAttribute('aria-valuenow', '0')
      expect(
        screen.getByRole('progressbar', { name: 'Gaslighting remaining' }),
      ).toHaveAttribute('aria-valuenow', '0')
    })

    it('should render policy actions for a manageable user', async () => {
      const viewedUser = testUsers.customer
      const connectedPolicy = buildPolicyWithUserLimits({
        id: 'policy-to-remove',
        name: 'Removable cover',
      })
      mockUserLimitsResponse([connectedPolicy])

      const { user } = await renderUserDetail(testUsers.admin, viewedUser)

      await openPoliciesTab(user)

      expect(
        await screen.findByRole('tab', { name: connectedPolicy.name }),
      ).toBeInTheDocument()
      const removeButton = screen.getByRole('button', {
        name: 'Remove policy from user',
      })
      expect(removeButton).toHaveAttribute('title', 'Remove policy from user')
      expect(
        screen.getByRole('button', { name: 'Add policy' }),
      ).toBeInTheDocument()
    })

    it('should hide policy add and remove actions from customer view', async () => {
      const policy = buildPolicyWithUserLimits()
      mockUserLimitsResponse([policy])
      const { user } = await renderUserDetail(testUsers.customer)

      await openPoliciesTab(user)

      expect(
        await screen.findByRole('tab', { name: policy.name }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Add policy' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Remove policy from user' }),
      ).not.toBeInTheDocument()
    })

    it('should render a loading state', async () => {
      server.use(
        http.get(`${env.API_URL}/users/:userId/limits`, async () => {
          await delay(1_000)
          return HttpResponse.json([])
        }),
      )
      const { user } = await renderUserDetail(testUsers.admin)

      await openPoliciesTab(user)

      expect(
        screen.getByRole('button', { name: 'Add policy' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(
        'Loading coverage limits...',
      )
    })

    it('should render an empty state when the user has no policies', async () => {
      mockUserLimitsResponse([])
      const { user } = await renderUserDetail(testUsers.admin)

      await openPoliciesTab(user)

      expect(
        screen.getByRole('button', { name: 'Add policy' }),
      ).toBeInTheDocument()
      expect(
        await screen.findByText('No coverage limits found'),
      ).toBeInTheDocument()
    })

    it('should render an inline error when coverage limits fail', async () => {
      server.use(
        http.get(`${env.API_URL}/users/:userId/limits`, () =>
          HttpResponse.json({}, { status: 500 }),
        ),
      )
      const { user } = await renderUserDetail(testUsers.admin)

      await openPoliciesTab(user)

      expect(
        screen.getByRole('button', { name: 'Add policy' }),
      ).toBeInTheDocument()
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Something went wrong while loading coverage limits.',
      )
      expect(
        screen.getByRole('tab', { name: 'Basic info' }),
      ).toBeInTheDocument()
    })
  })

  describe('permissions', () => {
    it('should let admin edit all users', async () => {
      await renderUserDetail(
        testUsers.admin,
        buildUser(testUsers.employee, {
          roles: ['employee', 'customer', 'admin'],
        }),
      )

      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      expect(editButton).toBeInTheDocument()
      expect(deleteButton).toBeInTheDocument()
    })

    it('should let employee edit a customer', async () => {
      await renderUserDetail(testUsers.employee, testUsers.customer)

      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.queryByRole('button', { name: /delete/i })

      expect(editButton).toBeInTheDocument()
      expect(deleteButton).not.toBeInTheDocument()
    })

    it('should not let employee edit other employees', async () => {
      await renderUserDetail(
        testUsers.employee,
        buildUser(testUsers.employee, { id: 'other-employee-id' }),
      )

      const editButton = screen.queryByRole('button', { name: /edit/i })

      expect(editButton).not.toBeInTheDocument()
    })

    it('should not let employee edit admins', async () => {
      await renderUserDetail(testUsers.employee, testUsers.admin)

      const editButton = screen.queryByRole('button', { name: /edit/i })

      expect(editButton).not.toBeInTheDocument()
    })

    it('should let everyone edit their own profile', async () => {
      await renderUserDetail(testUsers.customer)

      const editButton = screen.queryByRole('button', { name: /edit/i })

      expect(editButton).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      const { user } = await renderUserDetail(testUsers.admin)

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should open a delete alert when delete button is clicked', async () => {
      const { user } = await renderUserDetail(testUsers.admin)

      await user.click(screen.getByRole('button', { name: /delete/i }))

      const alertDialog = screen.getByRole('alertdialog')

      expect(alertDialog).toBeInTheDocument()
      expect(within(alertDialog).getByText(/are you sure/i)).toBeInTheDocument()
    })
  })
})
