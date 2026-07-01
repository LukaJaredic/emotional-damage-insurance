import type { BaseEntity } from './base-entity'

export type UserRole = 'admin' | 'employee' | 'customer'

export type User = BaseEntity & {
  firstName: string
  lastName: string
  email: string
  roles: UserRole[]
}
