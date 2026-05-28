import { expect, test, type Page } from '@playwright/test'

import { login, logout } from './utils/auth'

const adminUser = {
  email: 'admin@example.com',
  password: 'admin123',
}

const createdUser = {
  firstName: 'E2E Alpha',
  lastName: 'User',
  email: 'e2e-alpha@example.com',
  password: 'e2e-pass-123',
}

const updatedUser = {
  firstName: 'E2E Beta',
  lastName: 'Updated',
  email: 'e2e-beta@example.com',
}

const finalUser = {
  firstName: 'E2E Gamma',
  lastName: 'CanLogin',
  email: 'e2e-gamma@example.com',
  password: 'e2e-pass-456',
}

test('admin can create, edit, delete user and login as new user', async ({
  page,
}) => {
  await login(page, adminUser)
  await gotoUsers(page)

  // Can create a user

  await page.getByRole('button', { name: 'Create a user' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Create a user' }),
  ).toBeVisible()

  await fillUserForm(page, createdUser)
  await selectRoles(page, ['Admin', 'Employee'])
  await page.getByRole('button', { name: 'Create user' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Can see created user in the list

  await assertUserInTable(page, {
    firstName: createdUser.firstName,
    lastName: createdUser.lastName,
    email: createdUser.email,
    roles: ['admin', 'employee'],
  })

  // Can view user details

  await page
    .getByRole('link', {
      name: `${createdUser.firstName} ${createdUser.lastName}`,
    })
    .click()
  await expect(page).toHaveURL(/\/users\/.+/)

  await assertUserDetails(page, {
    fullName: `${createdUser.firstName} ${createdUser.lastName}`,
    email: createdUser.email,
    roles: ['Admin', 'Employee'],
  })

  // Can edit user details

  await page.getByRole('button', { name: 'Edit this user' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await fillUserForm(page, updatedUser)
  await removeRole(page, 'Employee')
  await page.getByRole('button', { name: 'Save user' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await assertUserDetails(page, {
    fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
    email: updatedUser.email,
    roles: ['Admin'],
  })
  await expect(page.getByText('Employee', { exact: true })).toHaveCount(0)

  // Can cancel deletion

  await page.getByRole('button', { name: 'Delete this user' }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()

  await expect(page).toHaveURL(/\/users\/.+/)
  await assertUserDetails(page, {
    fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
    email: updatedUser.email,
    roles: ['Admin'],
  })

  // Can delete user

  await page.getByRole('button', { name: 'Delete this user' }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page.waitForURL('/users')

  await expect(
    page.getByRole('link', {
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
    }),
  ).toHaveCount(0)
  await expect(page.getByText(updatedUser.email)).toHaveCount(0)

  // Can login as created user

  await page.getByRole('button', { name: 'Create a user' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await fillUserForm(page, finalUser)
  await selectRoles(page, ['Employee'])
  await page.getByRole('button', { name: 'Create user' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await assertUserInTable(page, {
    firstName: finalUser.firstName,
    lastName: finalUser.lastName,
    email: finalUser.email,
    roles: ['employee'],
  })

  await logout(page, '/users')
  await login(page, {
    email: finalUser.email,
    password: finalUser.password,
  })
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
})

async function gotoUsers(page: Page) {
  await page.getByRole('link', { name: 'Users' }).click()
  await page.waitForURL('/users')
  await expect(
    page.getByRole('heading', { name: 'Application users' }),
  ).toBeVisible()
}

async function fillUserForm(
  page: Page,
  values: {
    firstName: string
    lastName: string
    email: string
    password?: string
  },
) {
  await page.getByRole('textbox', { name: 'First name' }).fill(values.firstName)
  await page.getByRole('textbox', { name: 'Last name' }).fill(values.lastName)
  await page.getByRole('textbox', { name: 'Email' }).fill(values.email)

  if (values.password) {
    await page.getByRole('textbox', { name: 'Password' }).fill(values.password)
  }
}

async function selectRoles(page: Page, roles: string[]) {
  const rolesInput = page.getByRole('combobox', { name: 'Roles' })

  for (const role of roles) {
    await rolesInput.click()
    await page.getByRole('option', { name: role, exact: true }).click()
  }
}

async function removeRole(page: Page, role: string) {
  await page.getByRole('button', { name: `Remove ${role}` }).click()
}

async function assertUserInTable(
  page: Page,
  values: {
    firstName: string
    lastName: string
    email: string
    roles: string[]
  },
) {
  const fullName = `${values.firstName} ${values.lastName}`

  await expect(page.getByRole('link', { name: fullName })).toBeVisible()
  await expect(page.getByText(values.email, { exact: true })).toBeVisible()

  await expect(page.getByText(values.roles.join(', '))).toBeVisible()
}

async function assertUserDetails(
  page: Page,
  values: {
    fullName: string
    email: string
    roles: string[]
  },
) {
  await expect(
    page.getByRole('heading', { name: values.fullName }),
  ).toBeVisible()
  await expect(
    page.getByText(values.email, { exact: true }).first(),
  ).toBeVisible()

  await expect(
    page.getByText(values.roles.join(', '), { exact: true }).first(),
  ).toBeVisible()
}
