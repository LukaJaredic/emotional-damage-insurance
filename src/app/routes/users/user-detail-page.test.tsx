import type { UseQueryResult } from '@tanstack/react-query'
import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import AuthGuard from '@/app/auth-guard'
import { paths } from '@/config'
import { stringifyRoles } from '@/features/users/utils/user-labels'
import { buildUser, renderApp, testUsers } from '@/testing/test-utils'
import type { User } from '@/types'
import { useUserDetail } from '@features/users/api/get-user'

import UserDetailPage from './user-detail-page'

vi.mock('@features/users/api/get-user', () => ({
  useUserDetail: vi.fn(),
}))

const mockedUseUserDetail = vi.mocked(useUserDetail)

type QueryResult = Partial<UseQueryResult<User, Error>>

function buildUserDetailState(
  user: User,
  ...overrides: QueryResult[]
): QueryResult {
  return {
    data: user,
    isPending: false,
    isError: false,
    ...overrides,
  }
}

async function renderUserDetail(currentUser: User, viewedUser?: User) {
  mockedUseUserDetail.mockReturnValue(
    buildUserDetailState(viewedUser ?? currentUser) as UseQueryResult<
      User,
      Error
    >,
  )

  await renderApp(
    <AuthGuard shouldHaveUser page="users:detail-page">
      <UserDetailPage />
    </AuthGuard>,
    {
      user: currentUser,
      path: paths.users.detail.path,
      url: paths.users.detail.getHref((viewedUser ?? currentUser).id),
    },
  )

  return { user: userEvent.setup() }
}

describe('UserDetailPage', () => {
  describe('renders', () => {
    it("should render user's full name as title", async () => {
      const user = testUsers.admin
      await renderUserDetail(user)

      expect(
        screen.getAllByRole('heading', {
          name: `${user.firstName} ${user.lastName}`,
        }).length,
      ).toBeGreaterThan(0)
    })

    it("should render user's details", async () => {
      const user = testUsers.employee
      await renderUserDetail(user)

      expect(
        screen.getAllByText(stringifyRoles(user.roles)).length,
      ).toBeGreaterThan(0)
      expect(screen.getByText(user.firstName)).toBeInTheDocument()
      expect(screen.getByText(user.lastName)).toBeInTheDocument()

      expect(
        screen.getAllByRole('link', { name: user.email }).length,
      ).toBeGreaterThan(0)
    })

    it('should render activity section', async () => {
      const user = testUsers.admin
      await renderUserDetail(user)

      expect(
        screen.getByRole('heading', {
          name: 'Activity',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Activity feed will appear here.', { exact: false }),
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
