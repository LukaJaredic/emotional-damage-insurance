import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import type { User, UserRole } from '@/types/user'
import { buildPermissionsFor } from '@/utils'
import { db, persistDb } from '@testing/mocks/db'
import { requireAuth } from '@testing/mocks/db.utils'
import { hash, networkDelay, sanitizeUser } from '@testing/mocks/helpers'

type MockCreateUserBody = {
  firstName: string
  lastName: string
  email: string
  password: string
  roles: UserRole[]
}

type MockUpdateUserBody = Partial<MockCreateUserBody>

export type MockUser = MockCreateUserBody & {
  id: string
}

const DEFAULT_PER_PAGE = 25

const normalizePage = (value: string | null) => {
  const page = Number(value)

  if (!Number.isInteger(page) || page < 1) {
    return null
  }

  return page
}

const normalizePerPage = (value: string | null) => {
  const perPage = Number(value)

  if (!Number.isInteger(perPage) || perPage < 1) {
    return DEFAULT_PER_PAGE
  }

  return perPage
}

const getRequestedRoles = (searchParams: URLSearchParams) => {
  const requestedRoles = [
    ...searchParams.getAll('roles[]'),
    ...searchParams.getAll('roles'),
  ]

  return requestedRoles.filter(Boolean)
}

const findUserByEmail = (email: string) => {
  return db.user.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  })
}

const findUserById = (id: string) => {
  return db.user.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  })
}

export const usersHandlers = [
  http.get(`${env.API_URL}/users`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const { can } = buildPermissionsFor(user as User)

      const url = new URL(request.url)
      const page = normalizePage(url.searchParams.get('page'))

      if (!page) {
        return HttpResponse.json([])
      }

      const perPage = normalizePerPage(url.searchParams.get('perPage'))
      const search = url.searchParams.get('search')?.trim().toLowerCase()
      const requestedRoles = getRequestedRoles(url.searchParams)

      const users = db.user
        .getAll()
        .filter((candidate) => {
          if (!can('user:read', candidate as User)) {
            return false
          }

          if (!search) {
            return true
          }

          return [
            candidate.email,
            candidate.firstName,
            candidate.lastName,
          ].some((value) => value.toLowerCase().includes(search))
        })
        .filter((candidate) => {
          if (requestedRoles.length === 0) {
            return true
          }

          return candidate.roles.some((role) =>
            requestedRoles.includes(role as string),
          )
        })
        .map((candidate) => sanitizeUser(candidate))

      const startIndex = (page - 1) * perPage

      if (startIndex >= users.length) {
        return HttpResponse.json([])
      }

      return HttpResponse.json(users.slice(startIndex, startIndex + perPage))
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.get(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const foundUser = findUserById(String(params.userId))

      if (!foundUser) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 })
      }

      const { can } = buildPermissionsFor(user as User)

      if (!can('user:read', foundUser as User)) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }

      return HttpResponse.json(sanitizeUser(foundUser))
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.post(`${env.API_URL}/users`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const payload = (await request.json()) as MockCreateUserBody

      if (findUserByEmail(payload.email)) {
        return HttpResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 },
        )
      }

      const createdUser = db.user.create({
        ...payload,
        password: hash(payload.password),
      })

      await persistDb('user')

      return HttpResponse.json(sanitizeUser(createdUser), { status: 201 })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.patch(
    `${env.API_URL}/users/:userId`,
    async ({ cookies, params, request }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = String(params.userId)
        const existingUser = findUserById(userId)

        if (!existingUser) {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 },
          )
        }

        const payload = (await request.json()) as MockUpdateUserBody

        if (payload.email) {
          const userWithSameEmail = findUserByEmail(payload.email)

          if (userWithSameEmail && userWithSameEmail.id !== userId) {
            return HttpResponse.json(
              { message: 'User with this email already exists' },
              { status: 409 },
            )
          }
        }

        const updatedUser = db.user.update({
          where: {
            id: {
              equals: userId,
            },
          },
          data: {
            ...payload,
            ...(payload.password ? { password: hash(payload.password) } : {}),
          },
        })

        await persistDb('user')

        if (!updatedUser) {
          return HttpResponse.json(
            { message: 'User not found' },
            { status: 404 },
          )
        }

        return HttpResponse.json(sanitizeUser(updatedUser))
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),

  http.delete(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const userId = String(params.userId)
      const existingUser = findUserById(userId)

      if (!existingUser) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 })
      }

      const deletedUser = db.user.delete({
        where: {
          id: {
            equals: userId,
          },
        },
      })

      if (!deletedUser) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 })
      }

      await persistDb('user')

      return new HttpResponse(null, { status: 204 })
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),
]
