import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { paths } from '@/config'
import { env } from '@/config/env'
import { stringifyRoles } from '@/features/users/utils/user-labels'
import useMediaQuery from '@/hooks/use-media-query'
import { server } from '@/testing/mocks/server'
import { renderApp, testUsers } from '@/testing/test-utils'
import type { User, UserRole } from '@/types'
import AuthGuard from '@app/auth-guard'

import UsersMasterPage from './users-master-page'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

const returnedUsers = Object.values(testUsers)

function mockUsersResponse({
  users = returnedUsers,
  status = 200,
  onRequest,
}: {
  users?: User[]
  status?: number
  onRequest?: ((searchParams: URLSearchParams) => void) | undefined
} = {}) {
  server.use(
    http.get(`${env.API_URL}/users`, ({ request }) => {
      onRequest?.(new URL(request.url).searchParams)

      if (status >= 400) {
        return HttpResponse.json({ message: 'Server Error' }, { status })
      }

      return HttpResponse.json(users, { status })
    }),
  )
}

async function renderUsersMaster({
  isDesktop = true,
  role = 'admin',
  users = returnedUsers,
  status = 200,
  onUsersRequest,
}: {
  isDesktop?: boolean
  role?: UserRole
  users?: User[]
  status?: number
  onUsersRequest?: (searchParams: URLSearchParams) => void
} = {}) {
  mockedUseMediaQuery.mockReturnValue(isDesktop)
  mockUsersResponse({ users, status, onRequest: onUsersRequest })

  await renderApp(
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

  return { user: userEvent.setup() }
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
          await screen.findByRole('table', { name: 'Users table' }),
        ).toBeInTheDocument()
      }
    })

    it('should render the specified columns', async () => {
      await renderUsersMaster()

      expect(
        await screen.findByRole('columnheader', { name: /name/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /email/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /roles/i }),
      ).toBeInTheDocument()
    })

    it('should render rows that are returned', async () => {
      await renderUsersMaster()

      for (const user of returnedUsers) {
        const link = await screen.findByRole('link', {
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

      expect(await screen.findByRole('list')).toBeInTheDocument()
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
      await renderUsersMaster({ users: [] })

      expect(await screen.findByText('No users found.')).toBeInTheDocument()
    })

    it('should handle error', async () => {
      await renderUsersMaster({ status: 500 })

      expect(
        await screen.findByText(
          'An error occurred while loading users. Please try again.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should request users with selected filters', async () => {
      const requests: URLSearchParams[] = []
      const { user } = await renderUsersMaster({
        onUsersRequest: (searchParams) => {
          requests.push(new URLSearchParams(searchParams))
        },
      })

      await user.type(searchInput(), 'Mike')
      await user.click(rolesSelect())
      await user.click(await screen.findByRole('option', { name: 'Customer' }))

      await waitFor(() => {
        expect(requests.at(-1)?.get('search')).toBe('Mike')
        expect(requests.at(-1)?.get('roles[]')).toBe('customer')
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
      const { user } = await renderUsersMaster()

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
