import { screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { paths } from '@/config'
import { queryClient } from '@/lib'
import { createUser, renderApp } from '@/testing/test-utils'
import { queryKeys } from '@/utils'

import LoginPage from './login-page'

const USER_EMAIL = 'ronnie-coleman@email.com'
const USER_PASSWORD = '123admin321'

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

/**
 * We don't go into form details here since we have already tested
 * the LoginForm component separately.
 */
describe('Login Page', () => {
  let user!: ReturnType<typeof createUser>

  beforeAll(async () => {
    user = createUser({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    })
  })

  beforeEach(async () => {
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

    await fillForm(userEventInstance, USER_EMAIL, USER_PASSWORD)

    await userEventInstance.click(submitButton())

    await waitFor(() => {
      expect(screen.getByText('Good Redirect')).toBeInTheDocument()
    })

    expect(queryClient.getQueryData(queryKeys.auth.me())).toMatchObject({
      id: user.id,
      email: USER_EMAIL,
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
