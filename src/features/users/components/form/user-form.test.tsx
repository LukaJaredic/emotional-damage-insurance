import { screen } from '@testing-library/dom'
import { cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  buildUser,
  renderApp,
  selectOptions,
  testUsers,
} from '@/testing/test-utils'
import type { User } from '@/types'
import { useCreateUser } from '@features/users/api/create-user'
import { useUpdateUser } from '@features/users/api/update-user'
import type { UserFormStatus } from '@features/users/types/user-form.types'
import { roleLabels } from '@features/users/utils/user-labels'

import UserForm, { type UserFormProps } from './user-form'

vi.mock('@features/users/api/create-user', () => ({
  useCreateUser: vi.fn(),
}))

vi.mock('@features/users/api/update-user', () => ({
  useUpdateUser: vi.fn(),
}))

function mockUseCreateUser(
  overrides?: Partial<ReturnType<typeof useCreateUser>>,
) {
  const mutateAsync = vi.fn()

  vi.mocked(useCreateUser).mockReturnValue({
    mutateAsync,
    isPending: false,
    ...overrides,
  } as ReturnType<typeof useCreateUser>)

  return { mutateAsync }
}

function mockUseUpdateUser(
  overrides?: Partial<ReturnType<typeof useUpdateUser>>,
) {
  const mutateAsync = vi.fn()

  vi.mocked(useUpdateUser).mockReturnValue({
    mutateAsync,
    isPending: false,
    ...overrides,
  } as ReturnType<typeof useUpdateUser>)

  return { mutateAsync }
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
  const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
  const rolesSelect = screen.getByRole('combobox', {
    name: 'Roles',
  })

  await Promise.all([
    userEvent.clear(firstNameInput),
    userEvent.clear(lastNameInput),
    userEvent.clear(emailInput),
    passwordInput && userEvent.clear(passwordInput),
    userEvent.selectOptions(rolesSelect, []),
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
  beforeEach(() => {
    mockUseCreateUser()
    mockUseUpdateUser()
  })

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
      const mockedMutation = mockUseCreateUser()
      await renderForm(testUsers.admin)
      const submitButton = screen.getByRole('button', { name: 'Create user' })

      await fillFormFields(
        buildUser(testUsers.customer, { email: 'invalid-email' }),
        'new-password',
      )
      await userEvent.click(submitButton!)

      expect(mockedMutation.mutateAsync).not.toHaveBeenCalled()
    })

    it('should submit when valid', async () => {
      const mockedMutation = mockUseCreateUser()
      await renderForm(testUsers.admin)
      const submitButton = screen.getByRole('button', { name: 'Create user' })

      await fillFormFields(buildUser(testUsers.customer), 'new-password')
      await userEvent.click(submitButton!)

      const expectedFormData = { ...testUsers.customer } as any
      expectedFormData.password = 'new-password'
      delete expectedFormData.id
      delete expectedFormData.createdAt

      expect(mockedMutation.mutateAsync).toHaveBeenCalledExactlyOnceWith(
        expectedFormData,
      )
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
    let mockedMutation!: ReturnType<typeof mockUseCreateUser>
    let submitButton!: HTMLElement

    beforeEach(async () => {
      handleStatusChange = vi.fn()
      mockedMutation = mockUseCreateUser()
      await renderForm(
        testUsers.admin,
        undefined,
        handleStatusChange as UserFormProps['onStatusChange'],
      )
      submitButton = screen.getByRole('button', { name: 'Create user' })
    })

    it('should call #onStatusChange() with "pending" and "success" when submitted successfully', async () => {
      await fillFormFields(buildUser(testUsers.customer), 'new-password')
      await userEvent.click(submitButton!)

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      expect(handleStatusChange).toHaveBeenCalledWith('success')
    })

    it('should call #onStatusChange() with "pending" and "idle" when submitted unsuccessfully', async () => {
      mockedMutation.mutateAsync.mockRejectedValueOnce(
        new Error('Failed to create user'),
      )

      await fillFormFields(buildUser(testUsers.customer), 'new-password')
      await userEvent.click(submitButton!)

      expect(handleStatusChange).toHaveBeenCalledWith('pending')
      expect(handleStatusChange).toHaveBeenCalledWith('idle')
    })
  })
})
