import { addDays } from 'date-fns'
import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import type { BaseEntity, Policy, PolicyUser, User } from '@/types'
import { buildPermissionsFor } from '@/utils'
import { buildAuditFields, buildEditAuditFields } from '@testing/mocks/audit'
import { db, persistDb } from '@testing/mocks/db'
import { requireAuth } from '@testing/mocks/db.utils'
import { networkDelay, sanitizeUser } from '@testing/mocks/helpers'

import { mockApiError, mockInternalError } from './error-response'

type MockCreatePolicyBody = Omit<Policy, keyof BaseEntity | 'terminated'>

type MockPolicy = Omit<Policy, 'startDate' | 'endDate'> & {
  startDate: Date | string
  endDate: Date | string
}

type MockPolicyUser = PolicyUser

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

const normalizeBoolean = (value: string | null) => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return null
}

const normalizeDate = (value: string | null) => {
  if (!value) {
    return null
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return null
  }

  return timestamp
}

const toTimestamp = (value: Date | string | number) => {
  return new Date(value).getTime()
}

const findPolicyById = (id: string) => {
  return db.policy.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  })
}

const findPolicyByName = (name: string) => {
  return db.policy.findFirst({
    where: {
      name: {
        equals: name,
      },
    },
  })
}

const findPolicyHolderById = (id: string) => {
  return db.policyHolder.findFirst({
    where: {
      id: {
        equals: id,
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

const findPolicyUser = (policyId: string, userId: string) => {
  return db.policyUser.findFirst({
    where: {
      policyId: {
        equals: policyId,
      },
      userId: {
        equals: userId,
      },
    },
  })
}

const hasPolicyUsers = (policyId: string) => {
  return Boolean(
    db.policyUser.findFirst({
      where: {
        policyId: {
          equals: policyId,
        },
      },
    }),
  )
}

const sanitizePolicy = (policy: MockPolicy): Policy => {
  return {
    id: policy.id,
    createdAt: policy.createdAt,
    lastEditedAt: policy.lastEditedAt,
    createdBy: policy.createdBy,
    lastEditedBy: policy.lastEditedBy,
    policyHolderId: policy.policyHolderId,
    terminated: policy.terminated,
    name: policy.name,
    premium: policy.premium,
    startDate: new Date(policy.startDate),
    endDate: new Date(policy.endDate),
    limits: { ...policy.limits },
  }
}

const isValidPolicyDuration = (startDate: Date, endDate: Date) => {
  return toTimestamp(endDate) >= addDays(startDate, 1).getTime()
}

const getPolicyUsers = (policyId: string) => {
  return db.policyUser
    .getAll()
    .filter((policyUser) => policyUser.policyId === policyId)
}

const userIncludesSearch = (user: User, search: string) => {
  return [user.email, user.firstName, user.lastName].some((value) =>
    value.toLowerCase().includes(search),
  )
}

export const policiesHandlers = [
  http.get(`${env.API_URL}/policies`, async ({ cookies, request }) => {
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
      const terminated = normalizeBoolean(url.searchParams.get('terminated'))
      const policyHolderId = url.searchParams.get('policyHolderId')
      const search = url.searchParams.get('search')?.trim().toLowerCase()
      const userId = url.searchParams.get('userId')
      const startAfterDate = normalizeDate(
        url.searchParams.get('startAfterDate'),
      )
      const endBeforeDate = normalizeDate(url.searchParams.get('endBeforeDate'))
      const policyIdsForUser = userId
        ? db.policyUser
            .getAll()
            .filter((policyUser) => policyUser.userId === userId)
            .map((policyUser) => policyUser.policyId)
        : null

      const policies = db.policy
        .getAll()
        .map((candidate) => sanitizePolicy(candidate as unknown as MockPolicy))
        .filter((policy) => {
          if (!can('policy:read', policy)) {
            return false
          }

          if (terminated !== null && policy.terminated !== terminated) {
            return false
          }

          if (policyHolderId && policy.policyHolderId !== policyHolderId) {
            return false
          }

          if (search && !policy.name.toLowerCase().includes(search)) {
            return false
          }

          if (policyIdsForUser && !policyIdsForUser.includes(policy.id)) {
            return false
          }

          if (
            startAfterDate !== null &&
            toTimestamp(policy.startDate) < startAfterDate
          ) {
            return false
          }

          if (
            endBeforeDate !== null &&
            toTimestamp(policy.endDate) > endBeforeDate
          ) {
            return false
          }

          return true
        })
        .sort((a, b) => b.lastEditedAt - a.lastEditedAt)

      const startIndex = (page - 1) * perPage

      if (startIndex >= policies.length) {
        return HttpResponse.json([])
      }

      return HttpResponse.json(policies.slice(startIndex, startIndex + perPage))
    } catch {
      return mockInternalError()
    }
  }),

  http.get(`${env.API_URL}/policies/:policyId`, async ({ cookies, params }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
      }

      const foundPolicy = findPolicyById(String(params.policyId))

      if (!foundPolicy) {
        return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
      }

      const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
      const { can } = buildPermissionsFor(user as User)

      if (!can('policy:read', policy)) {
        return mockApiError({ code: 'FORBIDDEN', status: 403 })
      }

      return HttpResponse.json(policy)
    } catch {
      return mockInternalError()
    }
  }),

  http.post(`${env.API_URL}/policies`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
      }

      const { can } = buildPermissionsFor(user as User)

      if (!can('policy:create')) {
        return mockApiError({ code: 'FORBIDDEN', status: 403 })
      }

      const payload = (await request.json()) as MockCreatePolicyBody
      const startDate = new Date(payload.startDate)
      const endDate = new Date(payload.endDate)

      if (findPolicyByName(payload.name)) {
        return mockApiError({
          code: 'POLICY_ALREADY_EXISTS',
          status: 409,
          message: 'A policy with this name already exists.',
          fieldErrors: { name: ['A policy with this name already exists.'] },
        })
      }

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        !isValidPolicyDuration(startDate, endDate)
      ) {
        return mockApiError({
          code: 'POLICY_INVALID_DATE_RANGE',
          status: 400,
          fieldErrors: {
            endDate: ['The policy must last at least one day.'],
          },
        })
      }

      if (!findPolicyHolderById(payload.policyHolderId)) {
        return mockApiError({ code: 'POLICY_HOLDER_NOT_FOUND', status: 404 })
      }

      const createdPolicy = db.policy.create({
        ...buildAuditFields((user as User).id),
        policyHolderId: payload.policyHolderId,
        terminated: false,
        name: payload.name,
        premium: payload.premium,
        startDate,
        endDate,
        limits: { ...payload.limits },
      } as any)

      await persistDb('policy')

      return HttpResponse.json(
        sanitizePolicy(createdPolicy as unknown as MockPolicy),
        {
          status: 201,
        },
      )
    } catch {
      return mockInternalError()
    }
  }),

  http.delete(
    `${env.API_URL}/policies/:policyId`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const policyId = String(params.policyId)
        const foundPolicy = findPolicyById(policyId)

        if (!foundPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy:delete', policy)) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        if (hasPolicyUsers(policyId)) {
          return mockApiError({ code: 'POLICY_HAS_USERS', status: 409 })
        }

        const deletedPolicy = db.policy.delete({
          where: {
            id: {
              equals: policyId,
            },
          },
        })

        if (!deletedPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        await persistDb('policy')

        return new HttpResponse(null, { status: 204 })
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.patch(
    `${env.API_URL}/policies/:policyId/terminate`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const policyId = String(params.policyId)
        const foundPolicy = findPolicyById(policyId)

        if (!foundPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy:update', policy)) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        if (policy.terminated) {
          return mockApiError({
            code: 'POLICY_ALREADY_TERMINATED',
            status: 409,
          })
        }

        const updatedPolicy = db.policy.update({
          where: {
            id: {
              equals: policyId,
            },
          },
          data: {
            terminated: true,
            ...buildEditAuditFields((user as User).id),
          },
        })

        await persistDb('policy')

        if (!updatedPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        return HttpResponse.json(
          sanitizePolicy(updatedPolicy as unknown as MockPolicy),
        )
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.patch(
    `${env.API_URL}/policies/:policyId/reactivate`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const policyId = String(params.policyId)
        const foundPolicy = findPolicyById(policyId)

        if (!foundPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy:update', policy)) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        if (!policy.terminated) {
          return mockApiError({ code: 'POLICY_NOT_TERMINATED', status: 409 })
        }

        const updatedPolicy = db.policy.update({
          where: {
            id: {
              equals: policyId,
            },
          },
          data: {
            terminated: false,
            ...buildEditAuditFields((user as User).id),
          },
        })

        await persistDb('policy')

        if (!updatedPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        return HttpResponse.json(
          sanitizePolicy(updatedPolicy as unknown as MockPolicy),
        )
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.get(
    `${env.API_URL}/policies/:policyId/users`,
    async ({ cookies, params, request }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const policyId = String(params.policyId)
        const foundPolicy = findPolicyById(policyId)

        if (!foundPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy:read', policy)) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        const url = new URL(request.url)
        const page = normalizePage(url.searchParams.get('page'))

        if (!page) {
          return HttpResponse.json([])
        }

        const perPage = normalizePerPage(url.searchParams.get('perPage'))
        const search = url.searchParams.get('search')?.trim().toLowerCase()
        const connectedUserIds = getPolicyUsers(policyId).map(
          (policyUser) => policyUser.userId,
        )
        const users = db.user
          .getAll()
          .filter((candidate) => connectedUserIds.includes(candidate.id))
          .map((candidate) => sanitizeUser(candidate) as User)
          .filter((candidate) => can('user:read', candidate))
          .filter((candidate) => {
            if (!search) {
              return true
            }

            return userIncludesSearch(candidate, search)
          })
          .sort((a, b) => b.lastEditedAt - a.lastEditedAt)

        const startIndex = (page - 1) * perPage

        if (startIndex >= users.length) {
          return HttpResponse.json([])
        }

        return HttpResponse.json(users.slice(startIndex, startIndex + perPage))
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.post(
    `${env.API_URL}/policies/:policyId/users`,
    async ({ cookies, params, request }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const policyId = String(params.policyId)
        const foundPolicy = findPolicyById(policyId)

        if (!foundPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        const payload = (await request.json()) as { userId: User['id'] }
        const foundUser = findUserById(payload.userId)

        if (!foundUser) {
          return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
        }

        const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
        const targetUser = sanitizeUser(foundUser) as User
        const { can } = buildPermissionsFor(user as User)

        if (
          !can('policy:update', policy) ||
          !can('user:update', targetUser, '*')
        ) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        if (findPolicyUser(policyId, targetUser.id)) {
          return mockApiError({
            code: 'POLICY_USER_ALREADY_CONNECTED',
            status: 409,
          })
        }

        const createdPolicyUser = db.policyUser.create({
          ...buildAuditFields((user as User).id),
          policyId,
          userId: targetUser.id,
          limits: { ...policy.limits },
        } as any)

        await persistDb('policyUser')

        return HttpResponse.json(createdPolicyUser as MockPolicyUser, {
          status: 201,
        })
      } catch {
        return mockInternalError()
      }
    },
  ),

  http.delete(
    `${env.API_URL}/policies/:policyId/users/:userId`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return mockApiError({ code: 'AUTHENTICATION_REQUIRED', status: 401 })
        }

        const policyId = String(params.policyId)
        const userId = String(params.userId)
        const foundPolicy = findPolicyById(policyId)

        if (!foundPolicy) {
          return mockApiError({ code: 'POLICY_NOT_FOUND', status: 404 })
        }

        const foundUser = findUserById(userId)

        if (!foundUser) {
          return mockApiError({ code: 'USER_NOT_FOUND', status: 404 })
        }

        const policy = sanitizePolicy(foundPolicy as unknown as MockPolicy)
        const targetUser = sanitizeUser(foundUser) as User
        const { can } = buildPermissionsFor(user as User)

        if (
          !can('policy:update', policy) ||
          !can('user:update', targetUser, '*')
        ) {
          return mockApiError({ code: 'FORBIDDEN', status: 403 })
        }

        const existingPolicyUser = findPolicyUser(policyId, targetUser.id)

        if (!existingPolicyUser) {
          return mockApiError({
            code: 'POLICY_USER_NOT_CONNECTED',
            status: 409,
          })
        }

        const deletedPolicyUser = db.policyUser.delete({
          where: {
            id: {
              equals: existingPolicyUser.id,
            },
          },
        })

        if (!deletedPolicyUser) {
          return mockApiError({
            code: 'POLICY_USER_NOT_CONNECTED',
            status: 409,
          })
        }

        await persistDb('policyUser')

        return new HttpResponse(null, { status: 204 })
      } catch {
        return mockInternalError()
      }
    },
  ),
]
