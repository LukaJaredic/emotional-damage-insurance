import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect } from 'vitest'

import { initializeDb, resetDb } from './mocks/db'
import { server } from './mocks/server'

expect.extend(matchers)

beforeAll(async () => {
  resetDb()
  await initializeDb()
  server.listen()
})

afterEach(async () => {
  cleanup()
  server.resetHandlers()
  resetDb()
  await initializeDb()
})

afterAll(() => {
  server.close()
})
