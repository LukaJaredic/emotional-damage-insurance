export type UserRole = 'admin' | 'employee' | 'customer'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  roles: UserRole[]
}
