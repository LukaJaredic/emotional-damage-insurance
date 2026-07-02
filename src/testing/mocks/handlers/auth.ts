import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import { authenticate, requireAuth, AUTH_COOKIE } from '@testing/mocks/db.utils'
import { networkDelay } from '@testing/mocks/helpers'

import { mockApiError, mockInternalError } from './error-response'

type LoginBody = {
  email: string
  password: string
}

export const authHandlers = [
  http.post(`${env.API_URL}/auth/login`, async ({ request }) => {
    await networkDelay()

    try {
      const credentials = (await request.json()) as LoginBody
      const result = authenticate(credentials)

      return HttpResponse.json(result.user, {
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=${result.jwt}; Path=/;`,
        },
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Invalid email or password'
      ) {
        return mockApiError({ code: 'INVALID_CREDENTIALS', status: 401 })
      }

      return mockInternalError()
    }
  }),

  http.post(`${env.API_URL}/auth/logout`, async () => {
    await networkDelay()

    return HttpResponse.json(
      { message: 'Logged out' },
      {
        headers: {
          'Set-Cookie': `${AUTH_COOKIE}=; Path=/;`,
        },
      },
    )
  }),

  http.get(`${env.API_URL}/auth/me`, async ({ cookies }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
      }

      return HttpResponse.json(user)
    } catch {
      return mockInternalError()
    }
  }),
]
