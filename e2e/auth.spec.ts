import { test } from '@playwright/test'

import { login, logout } from './utils/auth'

const user = {
  email: 'admin@example.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  roles: ['admin'],
}

test('authenticate', async ({ page }) => {
  await login(page, user)
  await logout(page)
})
