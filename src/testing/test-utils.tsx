import { screen, waitForElementToBeRemoved } from '@testing-library/dom'
import { render, type RenderOptions } from '@testing-library/react'
import type React from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import type { User } from '@/types/user'
import AppProvider from '@app/providers/app-provider'

import { db } from './mocks/db'
import { authenticate, hash } from './mocks/utils'

type BackendUser = User & { password: string }

const defaultUser: BackendUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  roles: ['admin'],
  password: hash('admin123'),
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
  waitForElementToBeRemoved(
    () => [
      ...screen.queryAllByTitle(/loading/i),
      ...screen.queryAllByText(/loading/i),
    ],
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
  user?: BackendUser | null
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
  const initializedUser = initializeUser(user)

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
