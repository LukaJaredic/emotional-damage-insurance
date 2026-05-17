import { test } from '@playwright/test'

const user = {
  email: 'admin@example.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  roles: ['admin'],
}

test('authenticate', async ({ page }) => {
  // Get redirected to the login page:
  await page.goto('/')
  await page.waitForURL('/auth/login?redirectTo=%2F')
  // Log in:
  await page.getByLabel('Email').click()
  await page.getByLabel('Email').fill(user.email)
  await page.getByRole('textbox', { name: 'Password' }).click()
  await page.getByRole('textbox', { name: 'Password' }).fill(user.password)
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await page.waitForURL('/')
  // Log out:
  await page.getByRole('button', { name: 'Log out' }).click()
  await page.waitForURL('/auth/login?redirectTo=%2F')
})
