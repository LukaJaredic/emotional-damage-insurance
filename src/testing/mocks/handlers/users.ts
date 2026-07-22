import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import type {
  BaseEntity,
  Policy,
  PolicyLimits,
  PolicyWithUserLimits,
} from '@/types'
import type { User } from '@/types/user'
import { buildPermissionsFor } from '@/utils'
import {
  buildAuditFields,
  buildEditAuditFields,
  compact,
} from '@testing/mocks/audit'
import { db, persistDb } from '@testing/mocks/db'
import { requireAuth } from '@testing/mocks/db.utils'
import { hash, networkDelay, sanitizeUser } from '@testing/mocks/helpers'

import { mockApiError, mockInternalError } from './error-response'

type MockCreateUserBody = Omit<User, keyof BaseEntity> & {
  password: string
}

type MockUpdateUserBody = Partial<MockCreateUserBody>

export type MockUser = MockCreateUserBody & {
  id: string
  createdAt?: number
  lastEditedAt?: number
  createdBy?: string
  lastEditedBy?: string
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
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
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
        .sort((a, b) => b.lastEditedAt - a.lastEditedAt)

      const startIndex = (page - 1) * perPage

      if (startIndex >= users.length) {
        return HttpResponse.json([])
      }

      return HttpResponse.json(users.slice(startIndex, startIndex + perPage))
    } catch {
      return mockInternalError()
    }
  }),

  http.get(
    `${env.API_URL}/users/:userId/limits`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const userId = String(params.userId)
        const foundUser = findUserById(userId)

        if (!foundUser) {
          return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
        }

        const { can } = buildPermissionsFor(user as User)

        if (!can('user:read', foundUser as User)) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        const policies = db.policyUser
          .getAll()
          .filter((relationship) => relationship.userId === userId)
          .flatMap((relationship) => {
            const policy = db.policy.findFirst({
              where: {
                id: {
                  equals: relationship.policyId,
                },
              },
            })

            if (!policy) {
              return []
            }

            const result: PolicyWithUserLimits = {
              ...(policy as unknown as Policy),
              startDate: new Date(policy.startDate),
              endDate: new Date(policy.endDate),
              limits: { ...(policy.limits as PolicyLimits) },
              userId: relationship.userId,
              userLimits: { ...(relationship.limits as PolicyLimits) },
              relationship: {
                id: relationship.id,
                createdAt: relationship.createdAt,
                lastEditedAt: relationship.lastEditedAt,
                createdBy: relationship.createdBy,
                lastEditedBy: relationship.lastEditedBy,
              },
            }

            return [result]
          })
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

        return HttpResponse.json(policies)
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.get(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
      }

      const foundUser = findUserById(String(params.userId))

      if (!foundUser) {
        return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
      }

      const { can } = buildPermissionsFor(user as User)

      if (!can('user:read', foundUser as User)) {
        return mockApiError({ code: 'FORBIDDEN', status: 403 })
      }

      return HttpResponse.json(sanitizeUser(foundUser))
    } catch {
      return mockInternalError()
    }
  }),

  http.post(`${env.API_URL}/users`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
      }

      const payload = (await request.json()) as MockCreateUserBody
      const { email, firstName, lastName, password, roles } = payload

      if (findUserByEmail(email)) {
        return mockApiError({
          code: 'USER_ALREADY_EXISTS',
          status: 409,
          message: 'A user with this email already exists.',
          fieldErrors: { email: ['A user with this email already exists.'] },
        })
      }

      const createdUser = db.user.create({
        ...buildAuditFields((user as User).id),
        email,
        firstName,
        lastName,
        password: hash(password),
        roles,
      })

      await persistDb('user')

      return HttpResponse.json(sanitizeUser(createdUser), { status: 201 })
    } catch {
      return mockInternalError()
    }
  }),

  http.patch(
    `${env.API_URL}/users/:userId`,
    async ({ cookies, params, request }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const userId = String(params.userId)
        const existingUser = findUserById(userId)

        if (!existingUser) {
          return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
        }

        const payload = (await request.json()) as MockUpdateUserBody

        if (payload.email) {
          const userWithSameEmail = findUserByEmail(payload.email)

          if (userWithSameEmail && userWithSameEmail.id !== userId) {
            return mockApiError({
              code: 'USER_ALREADY_EXISTS',
              status: 409,
              message: 'A user with this email already exists.',
              fieldErrors: {
                email: ['A user with this email already exists.'],
              },
            })
          }
        }

        const updatedUser = db.user.update({
          where: {
            id: {
              equals: userId,
            },
          },
          data: {
            ...compact({
              email: payload.email,
              firstName: payload.firstName,
              lastName: payload.lastName,
              roles: payload.roles,
            }),
            ...(payload.password ? { password: hash(payload.password) } : {}),
            ...buildEditAuditFields((user as User).id),
          },
        })

        await persistDb('user')

        if (!updatedUser) {
          return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
        }

        return HttpResponse.json(sanitizeUser(updatedUser))
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.delete(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
      }

      const userId = String(params.userId)
      const existingUser = findUserById(userId)

      if (!existingUser) {
        return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
      }

      const deletedUser = db.user.delete({
        where: {
          id: {
            equals: userId,
          },
        },
      })

      if (!deletedUser) {
        return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
      }

      await persistDb('user')

      return new HttpResponse(null, { status: 204 })
    } catch {
      return mockInternalError()
    }
  }),
]
