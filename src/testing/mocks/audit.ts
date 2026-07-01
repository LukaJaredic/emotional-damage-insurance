import type { BaseEntity, User } from '@/types'

export const DEFAULT_AUDIT_USER_ID = 'admin-user'

export function buildAuditFields(userId: User['id'], timestamp = Date.now()) {
  return {
    createdAt: timestamp,
    lastEditedAt: timestamp,
    createdBy: userId,
    lastEditedBy: userId,
  } satisfies Omit<BaseEntity, 'id'>
}

export function buildEditAuditFields(
  userId: User['id'],
  timestamp = Date.now(),
) {
  return {
    lastEditedAt: timestamp,
    lastEditedBy: userId,
  } satisfies Pick<BaseEntity, 'lastEditedAt' | 'lastEditedBy'>
}

export function compact<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => typeof value !== 'undefined'),
  ) as Partial<T>
}
