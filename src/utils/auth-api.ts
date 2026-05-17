import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryOptions,
} from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { User } from '@/types/user'

async function getMe() {
  const { data } = await api.get<User>('/auth/me')
  return data
}

async function logout() {
  await api.post('/auth/logout')
}

export function useMe(queryOptions?: QueryOptions<User>) {
  return useQuery({
    queryKey: ['me'],
    staleTime: Infinity,
    queryFn: getMe,
    retry: false,
    ...queryOptions,
  })
}

export function useLogout() {
  const qk = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Should trigger a redirect to the login page in <AuthGuard />
      qk.clear()
    },
  })
}
