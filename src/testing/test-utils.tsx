import { screen, waitFor } from '@testing-library/dom'
import { render, type RenderOptions } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type React from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import type { User, UserRole } from '@/types/user'
import AppProvider from '@app/providers/app-provider'

import { db } from './mocks/db'
import { authenticate, AUTH_COOKIE } from './mocks/db.utils'
import { hash } from './mocks/helpers'

type BackendUser = User & { password: string }

const DEFAULT_PASSWORD = 'admin123'

const defaultUser: BackendUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  roles: ['admin'],
  password: hash(DEFAULT_PASSWORD),
  createdAt: Date.now(),
}

export const createUser = (userProperties?: Partial<BackendUser>) => {
  const user = {
    ...defaultUser,
    ...userProperties,
    ...(userProperties?.password
      ? { password: hash(userProperties.password) }
      : {}),
  }

  db.user.create(user)

  return user
}

export const loginAsUser = (user: Pick<BackendUser, 'email' | 'password'>) => {
  const authUser = authenticate(user)

  return authUser
}

export const waitForLoadingToFinish = () =>
  waitFor(
    () => {
      expect([
        ...screen.queryAllByTitle(/Loading user data.../i),
        ...screen.queryAllByText(/Loading user data.../i),
      ]).toHaveLength(0)
    },
    { timeout: 4000 },
  )

const initializeUser = (user: any) => {
  if (typeof user === 'undefined') {
    const newUser = createUser()
    return loginAsUser(newUser)
  } else if (user) {
    return loginAsUser(user)
  } else {
    return null
  }
}

type RenderOptionsProps = {
  user?: Partial<BackendUser> | null
  url?: string
  path?: string
  additionalRoutes?: { element: React.ReactElement; path: string }[]
  renderOptions?: Omit<RenderOptions, 'wrapper'>
}

export const renderApp = async (
  ui: React.ReactElement,
  {
    user,
    url = '/',
    path = '/',
    additionalRoutes = [],
    renderOptions,
  }: RenderOptionsProps = {},
) => {
  // if you want to render the app unauthenticated then pass "null" as the user
  const initializedUser = initializeUser(
    user
      ? // createUser will hash the password, so we need to pass the password in plain text to loginAsUser
        { ...createUser(user), password: user?.password || DEFAULT_PASSWORD }
      : null,
  )

  if (initializedUser) {
    document.cookie = `${AUTH_COOKIE}=${initializedUser.jwt}; Path=/;`
  }

  const router = createMemoryRouter(
    [
      {
        element: <AppProvider />,
        children: [
          {
            path: path,
            element: ui,
          },
          ...additionalRoutes,
        ],
      },
    ],
    {
      initialEntries: url ? ['/', url] : ['/'],
      initialIndex: url ? 1 : 0,
    },
  )

  const renderResult = render(<RouterProvider router={router} />, renderOptions)

  const returnValue = {
    ...renderResult,
    user: initializedUser,
  }

  await waitForLoadingToFinish()

  return returnValue
}

export const testUsers: Record<UserRole, User> = {
  admin: {
    id: 'admin-id',
    firstName: 'Walter',
    lastName: 'White',
    email: 'admin@email.com',
    roles: ['admin'],
    createdAt: Date.now(),
  },
  employee: {
    id: 'employee-id',
    firstName: 'Sherlock',
    lastName: 'Holmes',
    email: 'employee@email.com',
    roles: ['employee'],
    createdAt: Date.now(),
  },
  customer: {
    id: 'customer-id',
    firstName: 'Jack',
    lastName: 'Reacher',
    email: 'customer@email.com',
    roles: ['customer'],
    createdAt: Date.now(),
  },
}

export function buildUser(user: User, overrides?: Partial<User>): User {
  return {
    ...user,
    ...overrides,
  }
}

export async function selectOptions(select: HTMLElement, options: string[]) {
  for (const option of options) {
    await userEvent.click(select)
    await userEvent.click(await screen.findByRole('option', { name: option }))
  }
}

export async function deselectOptions(options: string[]) {
  for (const option of options) {
    await userEvent.click(
      await screen.findByRole('button', { name: `Remove ${option}` }),
    )
  }
}

export async function clearSelects() {
  screen
    .queryAllByRole('button', {
      name: /remove/i,
    })
    .forEach((button) => {
      userEvent.click(button)
    })
}
