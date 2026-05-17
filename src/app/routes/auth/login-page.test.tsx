import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { paths } from '@/config/paths'
import { queryKeys } from '@/config/query-keys'
import { queryClient } from '@/lib/react-query'
import { createUser, renderApp } from '@/testing/test-utils'

import LoginPage from './login-page'

function emailInput() {
  return screen.getByLabelText('Email')
}

function passwordInput() {
  return screen.getByLabelText('Password')
}

function submitButton() {
  return screen.getByTitle('Log in', { exact: true })
}

async function fillForm(email: string, password: string) {
  await userEvent.clear(emailInput())
  await userEvent.type(emailInput(), email)

  await userEvent.clear(passwordInput())
  await userEvent.type(passwordInput(), password)
}

describe('Login Page', () => {
  let user!: ReturnType<typeof createUser>

  beforeAll(async () => {
    user = createUser({
      email: 'new-admin@whatever.com',
      password: '123admin321',
    })
  })

  beforeEach(async () => {
    queryClient.clear()

    await renderApp(<LoginPage />, {
      user: null,
      path: paths.auth.login.path,
      url: paths.auth.login.getHref('/additional-route'),
      additionalRoutes: [
        {
          element: <>Good Redirect</>,
          path: '/additional-route',
        },
      ],
    })
  })

  it('should log in with valid credentials and redirect to the requested route', async () => {
    await fillForm(user.email, '123admin321')

    await userEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.getByText('Good Redirect')).toBeInTheDocument()
    })

    expect(queryClient.getQueryData(queryKeys.auth.me())).toMatchObject({
      id: user.id,
      email: user.email,
      roles: user.roles,
    })
  })

  it('should not log in with invalid credentials and show an error message', async () => {
    await fillForm('invalid@example.com', 'invalid-password')

    await userEvent.click(submitButton())

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })

    expect(queryClient.getQueryData(queryKeys.auth.me())).toBeUndefined()
  })
})
