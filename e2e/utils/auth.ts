import { expect, type Page } from '@playwright/test'

type Credentials = {
  email: string
  password: string
}

async function login(page: Page, credentials: Credentials) {
  await page.goto('/')
  await page.waitForURL('/auth/login?redirectTo=%2F')
  await page.getByRole('textbox', { name: 'Email' }).fill(credentials.email)
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(credentials.password)
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await page.waitForURL('/')
}

async function logout(page: Page, redirectTo = '/') {
  await page.getByRole('button', { name: 'Log out' }).click()
  await page.waitForURL(
    redirectTo
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login',
  )
  await expect(
    page.getByRole('button', { name: 'Login', exact: true }),
  ).toBeVisible()
}

export { login, logout }
