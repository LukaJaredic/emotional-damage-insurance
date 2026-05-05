import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ModalProvider } from '@app/providers/modal-provider'
import { UserProvider } from '@app/providers/user-provider'
import { queryClient } from '@lib/react-query'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ModalProvider>{children}</ModalProvider>
      </UserProvider>
    </QueryClientProvider>
  )
}
