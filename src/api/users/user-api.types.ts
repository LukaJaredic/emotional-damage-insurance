import type { Policy, UserRole } from '@/types'

export type GetUsersQuery = {
  page: number
  perPage?: number
  search?: string
  roles?: UserRole[]
  noPolicyId?: Policy['id']
}

export type UseUsersQuery = Omit<GetUsersQuery, 'page'>
