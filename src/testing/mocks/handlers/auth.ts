import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import { authenticate, requireAuth, AUTH_COOKIE } from '@testing/mocks/db.utils'
import { networkDelay } from '@testing/mocks/helpers'

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
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        {
          status: error?.message === 'Invalid email or password' ? 401 : 500,
        },
      )
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
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      return HttpResponse.json({ data: user })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),
]
