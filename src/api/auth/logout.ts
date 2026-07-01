import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiPaths } from '@/config'
import { api } from '@/lib'

async function logout() {
  await api.post(apiPaths.auth.logout())
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
