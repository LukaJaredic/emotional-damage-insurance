import { screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { paths } from '@/config'
import { queryClient } from '@/lib'
import { createUser, renderApp } from '@/testing/test-utils'
import { queryKeys } from '@/utils'

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

async function fillForm(
  userEventInstance: UserEvent,
  email: string,
  password: string,
) {
  await userEventInstance.clear(emailInput())
  await userEventInstance.type(emailInput(), email)

  await userEventInstance.clear(passwordInput())
  await userEventInstance.type(passwordInput(), password)
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
    const userEventInstance = userEvent.setup()

    await fillForm(userEventInstance, user.email, '123admin321')

    await userEventInstance.click(submitButton())

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
    const userEventInstance = userEvent.setup()

    await fillForm(userEventInstance, 'invalid@example.com', 'invalid-password')

    await userEventInstance.click(submitButton())

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })

    expect(queryClient.getQueryData(queryKeys.auth.me())).toBeUndefined()
  })
})
