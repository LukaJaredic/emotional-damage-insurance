import { screen } from '@testing-library/dom'
import { cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import { server } from '@/testing/mocks/server'
import {
  buildUser,
  clearSelects,
  renderApp,
  selectOptions,
  testUsers,
} from '@/testing/test-utils'
import type { User } from '@/types'
import type { UserFormStatus } from '@features/users/types/user-form.types'
import { roleLabels } from '@features/users/utils/user-labels'

import UserForm from './user-form'
import type { UserFormProps } from './user-form'

function mockUserResponses({
  status = 201,
  onRequest,
}: {
  status?: number
  onRequest?: ((body: unknown) => void) | undefined
} = {}) {
  server.use(
    http.post(`${env.API_URL}/users`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      onRequest?.(body)

      if (status >= 400) {
        return HttpResponse.json({ message: 'Server Error' }, { status })
      }

      return HttpResponse.json({ id: 'created-user-id', ...body }, { status })
    }),
  )

  server.use(
    http.patch(`${env.API_URL}/users/:id`, async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>
      onRequest?.({ body, id: params.id })

      if (status >= 400) {
        return HttpResponse.json({ message: 'Server Error' }, { status })
      }

      return HttpResponse.json({ ...body }, { status })
    }),
  )
}

function renderForm(
  currentUser: User,
  userToEdit?: User,
  onStatusChange?: (status: UserFormStatus) => void,
  showSubmit: boolean = true,
) {
  return renderApp(
    <UserForm
      user={userToEdit}
      onStatusChange={onStatusChange}
      showSubmit={showSubmit}
    />,
    {
      user: currentUser,
    },
  )
}

async function fillFormFields(user: User, password?: string) {
  const firstNameInput = screen.getByLabelText('First name') as HTMLInputElement
  const lastNameInput = screen.getByLabelText('Last name') as HTMLInputElement
  const emailInput = screen.getByLabelText('Email') as HTMLInputElement
  const passwordInput = screen.queryByLabelText('Password') as HTMLInputElement
  const rolesSelect = screen.getByRole('combobox', {
    name: 'Roles',
  }) as HTMLSelectElement

  await Promise.all([
    userEvent.clear(firstNameInput),
    userEvent.clear(lastNameInput),
    userEvent.clear(emailInput),
    passwordInput && userEvent.clear(passwordInput),
    clearSelects(),
  ])

  await userEvent.type(firstNameInput, user.firstName)
  await userEvent.type(lastNameInput, user.lastName)
  await userEvent.type(emailInput, user.email)
  if (passwordInput) {
    await userEvent.type(passwordInput, password!)
  }
  await selectOptions(
    rolesSelect,
    user.roles.map((role) => roleLabels[role]),
  )
}

describe('UserForm', () => {
  describe('renders', () => {
    it('renders create fields', async () => {
      await renderForm(testUsers.admin)

      expect(screen.getByLabelText('First name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Roles')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Create user' }),
      ).toBeInTheDocument()
    })

    it('renders edit fields', async () => {
      await renderForm(testUsers.admin, testUsers.customer)

      expect(screen.getByLabelText('First name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Roles')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Save user' }),
      ).toBeInTheDocument()
    })

    it('should hide submit button', async () => {
      await renderForm(testUsers.admin, undefined, () => {}, false)

      expect(
        screen.queryByRole('button', { name: /create user/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should prevent submit when invalid', async () => {
      const requests: unknown[] = []
      mockUserResponses({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      await renderForm(testUsers.admin)
      const submitButton = screen.getByRole('button', { name: 'Create user' })

      await fillFormFields(
        buildUser(testUsers.customer, { email: 'invalid-email' }),
        'new-password',
      )
      await userEvent.click(submitButton!)

      expect(
        await screen.findByText('Invalid email address'),
      ).toBeInTheDocument()
      expect(requests).toHaveLength(0)
    })

    it('should create when valid', async () => {
      const requests: unknown[] = []
      mockUserResponses({
        onRequest: (body) => {
          requests.push(body)
        },
      })
      await renderForm(testUsers.admin)
      const submitButton = screen.getByRole('button', { name: 'Create user' })

      await fillFormFields(buildUser(testUsers.customer), 'new-password')
      await userEvent.click(submitButton!)

      const expectedFormData = { ...testUsers.customer } as any
      expectedFormData.password = 'new-password'
      delete expectedFormData.id
      delete expectedFormData.createdAt

      await waitFor(() => {
        expect(requests).toEqual([expectedFormData])
      })
    })

    it('should update when valid', async () => {
      const requests: unknown[] = []
      mockUserResponses({
        onRequest: (data) => {
          requests.push(data)
        },
      })
      await renderForm(testUsers.admin, testUsers.customer)
      const submitButton = screen.getByRole('button', { name: 'Save user' })

      await fillFormFields(
        buildUser(testUsers.customer, { firstName: 'Updated' }),
      )
      await userEvent.click(submitButton!)

      const expectedFormData = { ...testUsers.customer } as any
      delete expectedFormData.id
      delete expectedFormData.createdAt
      expectedFormData.firstName = 'Updated'

      await waitFor(() => {
        expect(requests).toEqual([
          { id: 'customer-id', body: expectedFormData },
        ])
      })
    })
  })

  describe('permissions', () => {
    it('should disable forbidden fields for non-admin users', async () => {
      for (const user of [testUsers.employee, testUsers.customer]) {
        cleanup()
        await renderForm(user, testUsers.customer)

        expect(screen.getByLabelText('First name')).toBeEnabled()
        expect(screen.getByLabelText('Last name')).toBeEnabled()
        expect(screen.getByLabelText('Email')).toBeEnabled()

        expect(screen.getByLabelText('Roles')).toBeDisabled()
      }
    })

    it('should enable all fields for admin users', async () => {
      await renderForm(testUsers.admin, testUsers.customer)

      expect(screen.getByLabelText('Roles')).toBeEnabled()
    })
  })

  describe('status changes', () => {
    let handleStatusChange!: ReturnType<typeof vi.fn>
    let submitButton!: HTMLElement

    beforeEach(async () => {
      handleStatusChange = vi.fn()
      await renderForm(
        testUsers.admin,
        undefined,
        handleStatusChange as UserFormProps['onStatusChange'],
      )
      submitButton = screen.getByRole('button', { name: 'Create user' })
    })

    it('should call #onStatusChange() with "pending" and "success" when submitted successfully', async () => {
      mockUserResponses()
      await fillFormFields(buildUser(testUsers.customer), 'new-password')
      await userEvent.click(submitButton!)

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      await waitFor(() => {
        expect(handleStatusChange).toHaveBeenCalledWith('success')
      })
    })

    it('should call #onStatusChange() with "pending" and "idle" when submitted unsuccessfully', async () => {
      mockUserResponses({ status: 500 })

      await fillFormFields(buildUser(testUsers.customer), 'new-password')
      await userEvent.click(submitButton!)

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      await waitFor(() => {
        expect(handleStatusChange).toHaveBeenCalledWith('idle')
      })
    })
  })
})
