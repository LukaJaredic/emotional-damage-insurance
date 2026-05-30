import isEqual from 'lodash/isEqual'

import type { User } from '@/types'
import type { StringKeyOf } from '@/types/util'

// Just add new resource:domain-types or [R:T], types will cascade
type ResourceMap = {
  user: User
}
type Resource = keyof ResourceMap
type Action = 'create' | 'read' | 'update' | 'delete'
type ResourceAction<R extends Resource> = `${R}:${Action}`

type PermissionRule<R extends Resource> = {
  // Conditions that must be met on the resource instance for the permission to apply
  // If null, the permission applies to all instances of the resource
  conditions: Partial<ResourceMap[R]> | null
  // Fields that the permission applies to
  // If empty, the permission applies to all fields of the resource
  allowedFields: StringKeyOf<ResourceMap[R]>[]
}
type PermissionStore = Map<ResourceAction<Resource>, PermissionRule<Resource>[]>

class PermissionsBuilder {
  #permissions: PermissionStore = new Map()

  get permissions() {
    return this.#permissions
  }

  allow<R extends Resource>(
    resourceAction: ResourceAction<R>,
    conditions?: Partial<ResourceMap[R]>,
    allowedFields?: StringKeyOf<ResourceMap[R]>[],
  ): PermissionsBuilder {
    if (!this.#permissions.has(resourceAction)) {
      this.#permissions.set(resourceAction, [])
    }

    getPermissionsFor(this.#permissions, resourceAction)!.push({
      conditions: conditions ?? null,
      allowedFields: allowedFields ?? [],
    })

    return this
  }

  #can<R extends Resource>(
    resourceAction: ResourceAction<R>,
    resourceInstance?: ResourceMap[R] | '*',
    field?: StringKeyOf<ResourceMap[R]> | '*',
  ): boolean {
    const resourcePermissions = getPermissionsFor(
      this.#permissions,
      resourceAction,
    )

    return checkPermissionFor(resourcePermissions, resourceInstance, field)
  }

  build() {
    return {
      can: this.#can.bind(this),
    }
  }
}

function getPermissionsFor<R extends Resource>(
  permissionMap: PermissionStore,
  resourceAction: ResourceAction<R>,
) {
  // Safe ts cast because the #allow() method checks the entrance!
  return permissionMap.get(resourceAction) as PermissionRule<R>[] | undefined
}

function checkPermissionFor<R extends Resource>(
  resourcePermissions: PermissionRule<R>[] | undefined,
  resourceInstance?: ResourceMap[R] | '*',
  field?: StringKeyOf<ResourceMap[R]> | '*',
): boolean {
  if (!resourcePermissions) {
    return false
  }

  return resourcePermissions.some(
    ({ conditions, allowedFields }) =>
      checkConditions(conditions, resourceInstance) &&
      checkFields(allowedFields, field),
  )
}

/**
 * Compares the conditions of the permission rule with the provided resource instance.
 *
 * @param conditions - Conditions that must be satisfied in order for permission to apply - `null` means "no conditions, applies to all instances"
 * @param resourceInstance - The instance of the resource we are asking about - `'*'` means "any instance"
 * @returns `true` if conditions are satisfied
 */
function checkConditions<R extends Resource>(
  conditions: Partial<ResourceMap[R]> | null,
  resourceInstance?: ResourceMap[R] | '*',
) {
  if (!conditions || resourceInstance === '*') {
    return true
  }

  if (!resourceInstance) {
    return false
  }

  return Object.keys(conditions).every((field) => {
    const conditionValue = conditions[field as keyof ResourceMap[R]]
    const resourceValue = resourceInstance[field as keyof ResourceMap[R]]

    return isEqual(
      Array.isArray(conditionValue)
        ? [...conditionValue].sort()
        : conditionValue,
      Array.isArray(resourceValue) ? [...resourceValue].sort() : resourceValue,
    )
  })
}

/**
 * Checks if the given `field` is covered with the permission that owns `allowedFields`.
 *
 * @param allowedFields - Fields for which the permission applies - [] means all fields
 * @param field - Field which we are asking about - "*" means "any field"
 * @returns `true` if the field is allowed
 */
function checkFields<R extends Resource>(
  allowedFields: StringKeyOf<ResourceMap[R]>[] | null,
  field?: StringKeyOf<ResourceMap[R]> | '*',
): boolean {
  if (!allowedFields?.length || field === '*') {
    return true
  }

  if (!field) {
    return false
  }

  return allowedFields.includes(field)
}

export {
  PermissionsBuilder,
  getPermissionsFor,
  checkPermissionFor,
  checkConditions,
  checkFields,
}
