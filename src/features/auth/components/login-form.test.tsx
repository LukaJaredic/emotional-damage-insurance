import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TooltipProvider } from '@/components/ui/tooltip'

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

describe('LoginForm', () => {
  it('renders the default credentials', () => {
    mockUseLogin()

    renderWithProviders(<LoginForm redirectTo="/" />)

    expect(emailInput()).toHaveValue('admin@example.com')
    expect(passwordInput()).toHaveValue('admin123')
  })

  it('shows validation errors and does not submit invalid data', async () => {
    const { mutate } = mockUseLogin()

    renderWithProviders(<LoginForm redirectTo="/" />)

    await userEvent.clear(emailInput())
    await userEvent.clear(passwordInput())

    await userEvent.type(emailInput(), 'invalid-email')
    await userEvent.type(passwordInput(), '123')

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      expect(
        screen.getByText('Field must be at least 6 characters long'),
      ).toBeInTheDocument()
    })

    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits valid form data', async () => {
    const { mutate } = mockUseLogin()

    renderWithProviders(<LoginForm redirectTo="/dashboard" />)

    await userEvent.clear(emailInput())
    await userEvent.clear(passwordInput())

    await userEvent.type(emailInput(), 'user@example.com')
    await userEvent.type(passwordInput(), 'password123')

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(mutate).toHaveBeenCalledExactlyOnceWith({
      email: 'user@example.com',
      password: 'password123',
    })
  })
})
