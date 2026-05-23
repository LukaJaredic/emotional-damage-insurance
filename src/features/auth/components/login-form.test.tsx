import { render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TooltipProvider } from '@/components/ui/shadcn/tooltip'

import { useLogin } from '../api/login'

import LoginForm from './login-form'

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <TooltipProvider>{children}</TooltipProvider>,
  })
}

vi.mock('../api/login', () => ({
  useLogin: vi.fn(),
}))

function mockUseLogin(overrides?: Partial<ReturnType<typeof useLogin>>) {
  const mutate = vi.fn()

  vi.mocked(useLogin).mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as ReturnType<typeof useLogin>)

  return { mutate }
}

function emailInput() {
  return screen.getByLabelText('Email') as HTMLInputElement
}

function passwordInput() {
  return screen.getByLabelText('Password') as HTMLInputElement
}

function submitButton() {
  return screen.getByTitle('Log in', { exact: true }) as HTMLButtonElement
}

async function clearAndType(user: UserEvent, email: string, password: string) {
  // Clearing because we have set defaults for convenience
  await user.clear(emailInput())
  await user.type(emailInput(), email)

  await user.clear(passwordInput())
  await user.type(passwordInput(), password)
}

describe('LoginForm', () => {
  let mutate!: ReturnType<typeof useLogin>['mutate']
  let user!: UserEvent

  beforeEach(() => {
    const result = mockUseLogin()
    mutate = result.mutate
    user = userEvent.setup()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the default credentials', () => {
    renderWithProviders(<LoginForm redirectTo="/" />)

    expect(emailInput()).toHaveValue('admin@example.com')
    expect(passwordInput()).toHaveValue('admin123')
  })

  describe('invalid form submission', () => {
    it('should handle invalid email', async () => {
      renderWithProviders(<LoginForm redirectTo="/" />)

      await clearAndType(user, 'invalid-email', 'valid-password')
      await user.click(submitButton())

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })

      expect(mutate).not.toHaveBeenCalled()
    })

    it('should handle invalid password', async () => {
      renderWithProviders(<LoginForm redirectTo="/" />)

      await clearAndType(user, 'user@example.com', 'short')
      await user.click(submitButton())

      await waitFor(() => {
        expect(
          screen.getByText('Field must be at least 6 characters long'),
        ).toBeInTheDocument()
      })

      expect(mutate).not.toHaveBeenCalled()
    })
  })

  describe('valid form submission', () => {
    it('submits valid form data', async () => {
      renderWithProviders(<LoginForm redirectTo="/dashboard" />)

      await clearAndType(user, 'user@example.com', 'password123')

      await user.click(submitButton())

      expect(mutate).toHaveBeenCalledExactlyOnceWith({
        email: 'user@example.com',
        password: 'password123',
      })
    })

    it('should disable the submit button while login is pending', async () => {
      mockUseLogin({ isPending: true })

      renderWithProviders(<LoginForm redirectTo="/" />)

      expect(submitButton()).toBeDisabled()
      expect(submitButton().querySelector('svg')).toBeInTheDocument()
    })
  })
})
