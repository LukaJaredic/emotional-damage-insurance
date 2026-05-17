import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import ModalProvider from '@app/providers/modal-provider'
import { queryClient } from '@lib/react-query'

import UserProvider from './user-provider'

function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <ModalProvider>
            <Outlet />
            <Toaster richColors position="top-center" />
          </ModalProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default AppProvider
