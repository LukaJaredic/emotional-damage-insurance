import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryOptions,
} from '@tanstack/react-query'

import { apiPaths } from '@/config'
import { api } from '@/lib'
import type { User } from '@/types'

import { queryKeys } from './query-keys'

async function getMe() {
  const { data } = await api.get<User>(apiPaths.auth.me())
  return data
}

async function logout() {
  await api.post(apiPaths.auth.logout())
}

export function useMe(queryOptions?: QueryOptions<User>) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
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
      // Triggers a redirect to the login page in <AuthGuard />
      qk.clear()
    },
  })
}
