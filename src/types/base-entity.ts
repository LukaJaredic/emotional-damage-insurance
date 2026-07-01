import type { User } from './user'

export type AuditFields = {
  createdAt: number
  lastEditedAt: number
  createdBy: User['id']
  lastEditedBy: User['id']
}

export type BaseEntity = AuditFields & {
  id: string
}
