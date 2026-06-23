import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import { networkDelay } from '@testing/mocks/helpers'

import { authHandlers } from './auth'
import { policyHoldersHandlers } from './policy-holders'
import { usersHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...policyHoldersHandlers,
  http.get(`${env.API_URL}/health`, async () => {
    await networkDelay()
    return HttpResponse.json({ ok: true })
  }),
]
