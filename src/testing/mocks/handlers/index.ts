import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'

import { networkDelay } from '../helpers'

import { authHandlers } from './auth'
import { usersHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  http.get(`${env.API_URL}/health`, async () => {
    await networkDelay()
    return HttpResponse.json({ ok: true })
  }),
]
