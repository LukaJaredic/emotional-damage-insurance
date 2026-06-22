import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { queryClient } from '@/lib'

import {
  MockIntersectionObserver,
  resetMockIntersectionObservers,
} from './intersection-observer-stub'
import { initializeDb, resetDb } from './mocks/db'
import { AUTH_COOKIE } from './mocks/db.utils'
import { server } from './mocks/server'

beforeAll(async () => {
  resetDb()
  await initializeDb()
  server.listen()
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(async () => {
  cleanup()

  resetMockIntersectionObservers()
  vi.clearAllMocks()

  resetDb()
  await initializeDb()
  server.resetHandlers()

  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0`
  queryClient.clear()
})

afterAll(() => {
  vi.unstubAllGlobals()
  server.close()
})
