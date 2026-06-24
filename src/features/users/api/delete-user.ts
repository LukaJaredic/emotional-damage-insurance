import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { apiPaths, paths } from '@/config'
import { api } from '@/lib'

import type { DeleteUserAction } from '../types/user-api.types'
import { userQueryKeys } from '../utils/user-query-keys'

export async function deleteUser({ userId }: DeleteUserAction) {
  await api.delete(apiPaths.users.one(userId))
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all() })
      navigate(paths.users.getHref())
      toast.success('User deleted successfully')
    },
  })
}
