import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RemoteDataState } from '@/components/data/remote-data'
import { paths } from '@/config'
import { stringifyRoles } from '@/features/users/utils/user-labels'
import useMediaQuery from '@/hooks/use-media-query'
import { renderApp, testUsers } from '@/testing/test-utils'
import type { User, UserRole } from '@/types'
import AuthGuard from '@app/auth-guard'
import { useUsers } from '@features/users/api/get-users'

import UsersMasterPage from './users-master-page'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

vi.mock('@features/users/api/get-users', () => ({
  useUsers: vi.fn(),
}))

const mockedUseMediaQuery = vi.mocked(useMediaQuery)
const mockedUseUsers = vi.mocked(useUsers)

const returnedUsers = Object.values(testUsers)

function buildUsersState(
  users: User[],
  overrides: Partial<RemoteDataState<User>> = {},
): RemoteDataState<User> {
  return {
    items: users,
    isInitialLoading: false,
    isFetchingMore: false,
    hasNextPage: false,
    isError: false,
    ...overrides,
  }
}

async function renderUsersMaster({
  isDesktop = true,
  role = 'admin',
}: {
  isDesktop?: boolean
  role?: UserRole
} = {}) {
  mockedUseMediaQuery.mockReturnValue(isDesktop)

  const result = await renderApp(
    <AuthGuard shouldHaveUser page="users:master-page">
      <UsersMasterPage />
    </AuthGuard>,
    {
      user: testUsers[role],
      path: paths.users.path,
      url: paths.users.getHref(),
      additionalRoutes: [
        {
          path: paths.notFound.path,
          element: <>404</>,
        },
      ],
    },
  )

  return {
    ...result,
    userEvent: userEvent.setup(),
  }
}

function searchInput() {
  return screen.getByPlaceholderText('Search by name or email')
}

function rolesSelect() {
  return screen.getByRole('combobox')
}

/**
 * We don't go into create form details here, since it has its own tests.
 */
describe('UsersMaster', () => {
  beforeEach(() => {
    mockedUseUsers.mockReturnValue(buildUsersState(returnedUsers))
  })

  it('should redirect customer to 404', async () => {
    await renderUsersMaster({ role: 'customer' })

    expect(screen.getByText('404')).toBeInTheDocument()
  })

  describe('renders', () => {
    it('should render filters', async () => {
      await renderUsersMaster()

      expect(searchInput()).toBeInTheDocument()
      expect(rolesSelect()).toBeInTheDocument()
    })

    it('should show a table to admins and employees', async () => {
      for (const role of ['admin', 'employee'] satisfies UserRole[]) {
        cleanup()

        await renderUsersMaster({ role })

        expect(
          screen.getByRole('table', { name: 'Users table' }),
        ).toBeInTheDocument()
      }
    })

    it('should render the specified columns', async () => {
      await renderUsersMaster()

      expect(
        screen.getByRole('columnheader', { name: /name/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', { name: /email/i }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', { name: /roles/i }),
      ).toBeInTheDocument()
    })

    it('should render rows that are returned', async () => {
      await renderUsersMaster()

      for (const user of returnedUsers) {
        const link = screen.getByRole('link', {
          name: `${user.firstName} ${user.lastName}`,
        })

        const row = link.closest('tr')

        expect(row).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          paths.users.detail.getHref(user.id),
        )
        expect(within(row!).getByText(user.email)).toBeInTheDocument()
        expect(
          within(row!).getByText(stringifyRoles(user.roles)),
        ).toBeInTheDocument()
      }
    })

    it('should render user cards on small screens', async () => {
      await renderUsersMaster({ isDesktop: false })

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()

      for (const user of returnedUsers) {
        const card = screen.getByRole('link', {
          name: new RegExp(`${user.firstName} ${user.lastName}`, 'i'),
        })

        expect(card).toHaveAttribute(
          'href',
          paths.users.detail.getHref(user.id),
        )

        expect(within(card).getByText(user.email)).toBeInTheDocument()
        expect(
          within(card).getByText(stringifyRoles(user.roles)),
        ).toBeInTheDocument()
      }
    })
  })

  describe('fetch states', () => {
    it('should handle empty', async () => {
      mockedUseUsers.mockReturnValue(buildUsersState([]))
      await renderUsersMaster()

      expect(screen.getByText('No users found.')).toBeInTheDocument()
    })

    it('should handle error', async () => {
      mockedUseUsers.mockReturnValue(buildUsersState([], { isError: true }))
      await renderUsersMaster()

      expect(
        screen.getByText(
          'An error occurred while loading users. Please try again.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should pass correct filter values to #useUsers()', async () => {
      const { userEvent: user } = await renderUsersMaster()

      mockedUseUsers.mockClear()

      await user.type(searchInput(), 'Mike')
      await user.click(rolesSelect())
      await user.click(await screen.findByRole('option', { name: 'Customer' }))

      await waitFor(() => {
        expect(mockedUseUsers).toHaveBeenLastCalledWith({
          search: 'Mike',
          roles: ['customer'],
        })
      })
    })

    it('should show a create button to admins and employees', async () => {
      for (const role of ['admin', 'employee'] satisfies UserRole[]) {
        cleanup()

        await renderUsersMaster({ role })

        expect(
          screen.getByRole('button', { name: 'Create a user' }),
        ).toBeInTheDocument()
      }
    })

    it('should open a create form when the create button is clicked', async () => {
      const { userEvent: user } = await renderUsersMaster()

      expect(
        screen.queryByRole('dialog', { name: 'Create a user' }),
      ).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Create a user' }))

      expect(
        screen.getByRole('dialog', { name: 'Create a user' }),
      ).toBeInTheDocument()
    })
  })
})
