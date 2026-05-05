import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { initializeDb, resetDb } from './mocks/db'
import { server } from './mocks/server'

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
