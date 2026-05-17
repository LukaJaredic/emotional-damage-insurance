export type UserRole = 'admin' | 'user'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}
