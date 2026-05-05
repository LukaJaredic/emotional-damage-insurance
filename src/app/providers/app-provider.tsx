import { QueryClientProvider } from '@tanstack/react-query'

import { TooltipProvider } from '@/components/ui/tooltip'
import ModalProvider from '@app/providers/modal-provider'
import UserProvider from '@app/providers/user-provider'
import { queryClient } from '@lib/react-query'

type AppProviderProps = {
  children: React.ReactNode
}

function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <ModalProvider>{children}</ModalProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default AppProvider
