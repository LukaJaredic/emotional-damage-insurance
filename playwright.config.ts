import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
const MOCK_API_PORT = 8080

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  globalSetup: './e2e/setup.ts',

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: [
    {
      command:
        'sh -c "MOCK_DB_FILE=mocked-db.e2e.json MOCK_DB_SEED_PROFILE=e2e npm run mock-server"',
      timeout: 10 * 1000,
      port: MOCK_API_PORT,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev',
      timeout: 10 * 1000,
      port: PORT,
      reuseExistingServer: true,
    },
  ],
})
