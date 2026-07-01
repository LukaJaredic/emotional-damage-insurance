import { HttpResponse, http } from 'msw'

import { env } from '@/config/env'
import type { BaseEntity, PolicyHolder, User } from '@/types'
import { buildPermissionsFor } from '@/utils'
import {
  buildAuditFields,
  buildEditAuditFields,
  compact,
} from '@testing/mocks/audit'
import { db, persistDb } from '@testing/mocks/db'
import { requireAuth } from '@testing/mocks/db.utils'
import { networkDelay } from '@testing/mocks/helpers'

type MockCreatePolicyHolderBody = Omit<PolicyHolder, keyof BaseEntity>

type MockUpdatePolicyHolderBody = Partial<MockCreatePolicyHolderBody>

type MockPolicyHolder = PolicyHolder & {
  firstName?: string
  lastName?: string
  businessName?: string
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

const findPolicyHolderById = (id: string) => {
  return db.policyHolder.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  })
}

const findPolicyHolderByEmail = (email: string) => {
  return db.policyHolder.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  })
}

const findPolicyHolderByGovernmentId = (governmentId: string) => {
  return db.policyHolder.findFirst({
    where: {
      governmentId: {
        equals: governmentId,
      },
    },
  })
}

const sanitizePolicyHolder = (policyHolder: MockPolicyHolder): PolicyHolder => {
  const base = {
    id: policyHolder.id,
    createdAt: policyHolder.createdAt,
    lastEditedAt: policyHolder.lastEditedAt,
    createdBy: policyHolder.createdBy,
    lastEditedBy: policyHolder.lastEditedBy,
    governmentId: policyHolder.governmentId,
    email: policyHolder.email,
    phone: policyHolder.phone,
  }

  if (policyHolder.type === 'business') {
    return {
      ...base,
      type: 'business',
      businessName: policyHolder.businessName ?? '',
    }
  }

  return {
    ...base,
    type: 'individual',
    firstName: policyHolder.firstName ?? '',
    lastName: policyHolder.lastName ?? '',
  }
}

const normalizePolicyHolderData = (
  payload: MockCreatePolicyHolderBody | MockUpdatePolicyHolderBody,
) => {
  const payloadFields = payload as Partial<{
    businessName: string
    firstName: string
    lastName: string
  }>
  const base = compact({
    email: payload.email,
    governmentId: payload.governmentId,
    phone: payload.phone,
    type: payload.type,
  })

  if (payload.type === 'business') {
    return compact({
      ...base,
      businessName: payloadFields.businessName,
      firstName: '',
      lastName: '',
    })
  }

  if (payload.type === 'individual') {
    return compact({
      ...base,
      firstName: payloadFields.firstName,
      lastName: payloadFields.lastName,
      businessName: '',
    })
  }

  return compact({
    ...base,
    businessName: payloadFields.businessName,
    firstName: payloadFields.firstName,
    lastName: payloadFields.lastName,
  })
}

const includesSearch = (policyHolder: MockPolicyHolder, search: string) => {
  const searchValues = [
    policyHolder.governmentId,
    policyHolder.email,
    policyHolder.phone,
    policyHolder.firstName,
    policyHolder.lastName,
    policyHolder.businessName,
  ]

  return searchValues.some((value) => value?.toLowerCase().includes(search))
}

export const policyHoldersHandlers = [
  http.get(`${env.API_URL}/policy-holders`, async ({ cookies, request }) => {
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
      const requestedType = url.searchParams.get('type')

      const policyHolders = db.policyHolder
        .getAll()
        .filter((candidate) => {
          const policyHolder = sanitizePolicyHolder(
            candidate as MockPolicyHolder,
          )

          if (!can('policy-holder:read', policyHolder)) {
            return false
          }

          if (requestedType && policyHolder.type !== requestedType) {
            return false
          }

          if (!search) {
            return true
          }

          return includesSearch(candidate as MockPolicyHolder, search)
        })
        .map((candidate) => sanitizePolicyHolder(candidate as MockPolicyHolder))
        .sort((a, b) => b.lastEditedAt - a.lastEditedAt)

      const startIndex = (page - 1) * perPage

      if (startIndex >= policyHolders.length) {
        return HttpResponse.json([])
      }

      return HttpResponse.json(
        policyHolders.slice(startIndex, startIndex + perPage),
      )
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.get(
    `${env.API_URL}/policy-holders/:policyHolderId`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const foundPolicyHolder = findPolicyHolderById(
          String(params.policyHolderId),
        )

        if (!foundPolicyHolder) {
          return HttpResponse.json(
            { message: 'Policy holder not found' },
            { status: 404 },
          )
        }

        const policyHolder = sanitizePolicyHolder(
          foundPolicyHolder as MockPolicyHolder,
        )
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy-holder:read', policyHolder)) {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        return HttpResponse.json(policyHolder)
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),

  http.post(`${env.API_URL}/policy-holders`, async ({ cookies, request }) => {
    await networkDelay()

    try {
      const { user } = requireAuth(cookies)

      if (!user) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const { can } = buildPermissionsFor(user as User)

      if (!can('policy-holder:create')) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }

      const payload = (await request.json()) as MockCreatePolicyHolderBody

      if (findPolicyHolderByGovernmentId(payload.governmentId)) {
        return HttpResponse.json(
          { message: 'Policy holder with this government ID already exists' },
          { status: 409 },
        )
      }

      if (findPolicyHolderByEmail(payload.email)) {
        return HttpResponse.json(
          { message: 'Policy holder with this email already exists' },
          { status: 409 },
        )
      }

      const createdPolicyHolder = db.policyHolder.create({
        ...normalizePolicyHolderData(payload),
        ...buildAuditFields((user as User).id),
      } as any)

      await persistDb('policyHolder')

      return HttpResponse.json(
        sanitizePolicyHolder(createdPolicyHolder as MockPolicyHolder),
        { status: 201 },
      )
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      )
    }
  }),

  http.patch(
    `${env.API_URL}/policy-holders/:policyHolderId`,
    async ({ cookies, params, request }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const policyHolderId = String(params.policyHolderId)
        const existingPolicyHolder = findPolicyHolderById(policyHolderId)

        if (!existingPolicyHolder) {
          return HttpResponse.json(
            { message: 'Policy holder not found' },
            { status: 404 },
          )
        }

        const existingPolicyHolderData = sanitizePolicyHolder(
          existingPolicyHolder as MockPolicyHolder,
        )
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy-holder:update', existingPolicyHolderData)) {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const payload = (await request.json()) as MockUpdatePolicyHolderBody

        if (payload.governmentId) {
          const policyHolderWithSameGovernmentId =
            findPolicyHolderByGovernmentId(payload.governmentId)

          if (
            policyHolderWithSameGovernmentId &&
            policyHolderWithSameGovernmentId.id !== policyHolderId
          ) {
            return HttpResponse.json(
              {
                message: 'Policy holder with this government ID already exists',
              },
              { status: 409 },
            )
          }
        }

        if (payload.email) {
          const policyHolderWithSameEmail = findPolicyHolderByEmail(
            payload.email,
          )

          if (
            policyHolderWithSameEmail &&
            policyHolderWithSameEmail.id !== policyHolderId
          ) {
            return HttpResponse.json(
              { message: 'Policy holder with this email already exists' },
              { status: 409 },
            )
          }
        }

        const updatedPolicyHolder = db.policyHolder.update({
          where: {
            id: {
              equals: policyHolderId,
            },
          },
          data: {
            ...normalizePolicyHolderData(payload),
            ...buildEditAuditFields((user as User).id),
          } as any,
        })

        await persistDb('policyHolder')

        if (!updatedPolicyHolder) {
          return HttpResponse.json(
            { message: 'Policy holder not found' },
            { status: 404 },
          )
        }

        return HttpResponse.json(
          sanitizePolicyHolder(updatedPolicyHolder as MockPolicyHolder),
        )
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),

  http.delete(
    `${env.API_URL}/policy-holders/:policyHolderId`,
    async ({ cookies, params }) => {
      await networkDelay()

      try {
        const { user } = requireAuth(cookies)

        if (!user) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const policyHolderId = String(params.policyHolderId)
        const existingPolicyHolder = findPolicyHolderById(policyHolderId)

        if (!existingPolicyHolder) {
          return HttpResponse.json(
            { message: 'Policy holder not found' },
            { status: 404 },
          )
        }

        const existingPolicyHolderData = sanitizePolicyHolder(
          existingPolicyHolder as MockPolicyHolder,
        )
        const { can } = buildPermissionsFor(user as User)

        if (!can('policy-holder:delete', existingPolicyHolderData)) {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const deletedPolicyHolder = db.policyHolder.delete({
          where: {
            id: {
              equals: policyHolderId,
            },
          },
        })

        if (!deletedPolicyHolder) {
          return HttpResponse.json(
            { message: 'Policy holder not found' },
            { status: 404 },
          )
        }

        await persistDb('policyHolder')

        return new HttpResponse(null, { status: 204 })
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        )
      }
    },
  ),
]
