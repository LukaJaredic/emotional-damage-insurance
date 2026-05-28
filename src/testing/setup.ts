import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import {
  MockIntersectionObserver,
  resetMockIntersectionObservers,
} from './intersection-observer-stub'
import { initializeDb, resetDb } from './mocks/db'
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
  server.resetHandlers()
  resetDb()
  await initializeDb()
})

afterAll(() => {
  vi.unstubAllGlobals()
  server.close()
})
