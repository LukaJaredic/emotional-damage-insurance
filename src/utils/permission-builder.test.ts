import { describe, expect, it } from 'vitest'

import type { User, StringKeyOf } from '@/types'

import {
  PermissionsBuilder,
  getPermissionsFor,
  checkPermissionFor,
  checkConditions,
  checkFields,
} from './permission-builder'

function createUser(overrides?: Partial<User>): User {
  return {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    roles: ['admin'],
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('PermissionBuilder', () => {
  let permissionBuilder: PermissionsBuilder

  beforeEach(() => {
    permissionBuilder = new PermissionsBuilder()
  })

  describe('#getPermissionsFor()', async () => {
    it('should return undefined if there are no permissions for a resource action', async () => {
      expect(
        getPermissionsFor(permissionBuilder.permissions, 'user:create'),
      ).toBeUndefined()
    })

    it('should return permissions if they exist for a resource action', async () => {
      permissionBuilder.permissions.set('user:create', [
        { conditions: null, allowedFields: [] },
      ])

      expect(
        getPermissionsFor(permissionBuilder.permissions, 'user:create'),
      ).deep.equal([
        {
          conditions: null,
          allowedFields: [],
        },
      ])
    })
  })

  describe('#allow()', async () => {
    it('should add multiple permissions for the same resource action', async () => {
      permissionBuilder
        .allow('user:create', { firstName: 'Admin' }, ['firstName'])
        .allow('user:create', { lastName: 'User' }, ['lastName'])

      expect(
        getPermissionsFor(permissionBuilder.permissions, 'user:create'),
      ).deep.equal([
        {
          conditions: { firstName: 'Admin' },
          allowedFields: ['firstName'],
        },
        {
          conditions: { lastName: 'User' },
          allowedFields: ['lastName'],
        },
      ])
    })
  })

  describe('#checkConditions()', async () => {
    it('should return true if conditions are null', async () => {
      expect(checkConditions(null, createUser())).toBe(true)
      expect(checkConditions(null)).toBe(true)
    })

    it("should return true if resource instance is '*'", async () => {
      expect(checkConditions({ firstName: 'Admin' }, '*')).toBe(true)
    })

    it('should return true if all conditions match, ignoring order of arrays', async () => {
      expect(
        checkConditions(
          {
            firstName: 'Admin',
            lastName: 'User',
            roles: ['customer', 'admin', 'employee'],
          },
          createUser({
            firstName: 'Admin',
            lastName: 'User',
            roles: ['admin', 'employee', 'customer'],
          }),
        ),
      ).toBe(true)
    })

    it('should return false if any condition does not match', async () => {
      expect(
        checkConditions(
          {
            firstName: 'Admin',
            lastName: 'User',
            roles: ['admin', 'employee'],
          },
          createUser({
            firstName: 'Admin',
            lastName: 'User',
            roles: ['admin'],
          }),
        ),
      ).toBe(false)
    })
  })

  describe('#checkFields()', async () => {
    describe('permissions allowed fields are empty', async () => {
      it("should return true if checked field is '*'", async () => {
        expect(checkFields([], '*')).toBe(true)
      })

      it('should return true if checked field is missing', async () => {
        expect(checkFields([])).toBe(true)
      })

      it('should return true if checked field is provided', async () => {
        expect(checkFields([], 'firstName')).toBe(true)
      })
    })

    describe('permissions allowed fields are provided', async () => {
      const allowedFields = ['firstName', 'lastName'] as StringKeyOf<User>[]

      it("should return true if checked field is '*'", async () => {
        expect(checkFields(allowedFields, '*')).toBe(true)
      })

      it('should return true if checked field is included in allowed fields', async () => {
        expect(checkFields(allowedFields, 'firstName')).toBe(true)
      })

      it('should return false if checked field is not included in allowed fields', async () => {
        expect(checkFields(allowedFields, 'email')).toBe(false)
      })

      it('should return false if checked field is missing', async () => {
        expect(checkFields(allowedFields)).toBe(false)
      })
    })
  })

  describe('#checkPermissionFor()', async () => {
    it('should return false if there are no permissions for the resource action', async () => {
      expect(
        checkPermissionFor(
          getPermissionsFor(permissionBuilder.permissions, 'user:create'),
          createUser(),
          'firstName',
        ),
      ).toBe(false)
    })

    it('should return true if there is a matching permission', async () => {
      permissionBuilder.allow('user:create', { firstName: 'Admin' }, [
        'firstName',
      ])

      expect(
        checkPermissionFor(
          getPermissionsFor(permissionBuilder.permissions, 'user:create'),
          createUser({ firstName: 'Admin' }),
          'firstName',
        ),
      ).toBe(true)
    })

    it('should return false if conditions do not match', async () => {
      permissionBuilder.allow('user:create', { firstName: 'Admin' }, [
        'firstName',
      ])

      expect(
        checkPermissionFor(
          getPermissionsFor(permissionBuilder.permissions, 'user:create'),
          createUser({ firstName: 'User' }),
          'firstName',
        ),
      ).toBe(false)
    })

    it('should return false if field is not allowed', async () => {
      permissionBuilder.allow('user:create', { firstName: 'Admin' }, [
        'firstName',
      ])

      expect(
        checkPermissionFor(
          getPermissionsFor(permissionBuilder.permissions, 'user:create'),
          createUser({ firstName: 'Admin' }),
          'email',
        ),
      ).toBe(false)
    })
  })
})
