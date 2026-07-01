import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { paths } from '@/config'
import { env } from '@/config/env'
import { name } from '@/features/policy-holders/utils/policy-holder-labels'
import useMediaQuery from '@/hooks/use-media-query'
import { server } from '@/testing/mocks/server'
import {
  renderApp,
  selectOptions,
  testAuditFields,
  testUsers,
} from '@/testing/test-utils'
import type { PolicyHolder, UserRole } from '@/types'
import AuthGuard from '@app/auth-guard'

import PolicyHoldersMasterPage from './policy-holders-master-page'

vi.mock('@/hooks/use-media-query', () => ({
  default: vi.fn(),
}))

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

const returnedPolicyHolders: PolicyHolder[] = [
  {
    ...testAuditFields,
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    type: 'individual',
    phone: '1234567890',
    governmentId: '123456789',
  },
  {
    ...testAuditFields,
    id: '2',
    businessName: 'Acme Inc.',
    email: 'acme.inc@example.com',
    type: 'business',
    phone: '0987654321',
    governmentId: '987654321',
  },
]

function mockPolicyHoldersResponse({
  policyHolders = returnedPolicyHolders,
  status = 200,
  onRequest,
}: {
  policyHolders?: PolicyHolder[]
  status?: number
  onRequest?: ((searchParams: URLSearchParams) => void) | undefined
} = {}) {
  server.use(
    http.get(`${env.API_URL}/policy-holders`, ({ request }) => {
      onRequest?.(new URL(request.url).searchParams)

      if (status >= 400) {
        return HttpResponse.json({ message: 'Server Error' }, { status })
      }

      return HttpResponse.json(policyHolders, { status })
    }),
  )
}

async function renderPolicyHoldersMaster({
  isDesktop = true,
  role = 'admin',
  policyHolders = returnedPolicyHolders,
  status = 200,
  onPolicyHoldersRequest,
}: {
  isDesktop?: boolean
  role?: UserRole
  policyHolders?: PolicyHolder[]
  status?: number
  onPolicyHoldersRequest?: (searchParams: URLSearchParams) => void
} = {}) {
  mockedUseMediaQuery.mockReturnValue(isDesktop)
  mockPolicyHoldersResponse({
    policyHolders,
    status,
    onRequest: onPolicyHoldersRequest,
  })

  await renderApp(
    <AuthGuard shouldHaveUser page="policy-holders:master-page">
      <PolicyHoldersMasterPage />
    </AuthGuard>,
    {
      user: testUsers[role],
      path: paths.policyHolders.path,
      url: paths.policyHolders.getHref(),
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
  return screen.getByPlaceholderText('Name, email, phone, gov. id')
}

function typeSelect() {
  return screen.getByRole('combobox')
}

/**
 * We don't go into create form details here, since it has its own tests.
 */
describe('PolicyHoldersMaster', () => {
  it('should redirect customer to 404', async () => {
    await renderPolicyHoldersMaster({ role: 'customer' })

    expect(screen.getByText('404')).toBeInTheDocument()
  })

  describe('renders', () => {
    it('should render filters', async () => {
      await renderPolicyHoldersMaster()

      expect(searchInput()).toBeInTheDocument()
      expect(typeSelect()).toBeInTheDocument()
    })

    it('should show a table to admins and employees', async () => {
      for (const role of ['admin', 'employee'] satisfies UserRole[]) {
        cleanup()

        await renderPolicyHoldersMaster({ role })

        expect(
          await screen.findByRole('table', { name: 'Policy holders table' }),
        ).toBeInTheDocument()
      }
    })

    it('should render the specified columns', async () => {
      await renderPolicyHoldersMaster()

      expect(
        await screen.findByRole('columnheader', { name: /name/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /type/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /email/i }),
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('columnheader', { name: /phone/i }),
      ).toBeInTheDocument()
    })

    it('should render rows that are returned', async () => {
      await renderPolicyHoldersMaster()

      for (const policyHolder of returnedPolicyHolders) {
        const link = await screen.findByRole('link', {
          name: name(policyHolder),
        })

        const row = link.closest('tr')

        expect(row).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          paths.policyHolders.detail.getHref(policyHolder.id),
        )
        expect(within(row!).getByText(policyHolder.email)).toBeInTheDocument()
      }
    })

    it('should render user cards on small screens', async () => {
      await renderPolicyHoldersMaster({ isDesktop: false })

      expect(await screen.findByRole('list')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()

      for (const policyHolder of returnedPolicyHolders) {
        const card = screen.getByRole('link', {
          name: new RegExp(name(policyHolder), 'i'),
        })

        expect(card).toHaveAttribute(
          'href',
          paths.policyHolders.detail.getHref(policyHolder.id),
        )

        expect(within(card).getByText(policyHolder.email)).toBeInTheDocument()
      }
    })
  })

  describe('fetch states', () => {
    it('should handle empty', async () => {
      await renderPolicyHoldersMaster({ policyHolders: [] })

      expect(
        await screen.findByText('No policy holders found.'),
      ).toBeInTheDocument()
    })

    it('should handle error', async () => {
      await renderPolicyHoldersMaster({ status: 500 })

      expect(
        await screen.findByText(
          'An error occurred while loading policy holders. Please try again.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should request policy holders with selected filters', async () => {
      const requests: URLSearchParams[] = []
      const { user } = await renderPolicyHoldersMaster({
        onPolicyHoldersRequest: (searchParams) => {
          requests.push(new URLSearchParams(searchParams))
        },
      })

      await user.type(searchInput(), 'Mike')
      await selectOptions(typeSelect(), ['Individual'])

      await waitFor(() => {
        expect(requests.at(-1)?.get('search')).toBe('Mike')
        expect(requests.at(-1)?.get('type')).toBe('individual')
      })
    })

    it('should show a create button to admins and employees', async () => {
      for (const role of ['admin', 'employee'] satisfies UserRole[]) {
        cleanup()

        await renderPolicyHoldersMaster({ role })

        expect(
          screen.getByRole('button', { name: 'Create a policy holder' }),
        ).toBeInTheDocument()
      }
    })

    it.todo(
      'should open a create form when the create button is clicked',
      async () => {
        // const { user } = await renderPolicyHoldersMaster()
        // expect(
        //   screen.queryByRole('dialog', { name: 'Create a policy holder' }),
        // ).not.toBeInTheDocument()
        // await user.click(
        //   screen.getByRole('button', { name: 'Create a policy holder' }),
        // )
        // expect(
        //   screen.getByRole('dialog', { name: 'Create a policy holder' }),
        // ).toBeInTheDocument()
      },
    )
  })
})
