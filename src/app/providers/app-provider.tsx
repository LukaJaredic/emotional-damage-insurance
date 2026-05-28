import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/shadcn/sonner'
import { TooltipProvider } from '@/components/ui/shadcn/tooltip'
import { queryClient } from '@/lib'

import UserProvider from './user-provider'

function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Outlet />
          <Toaster richColors position="top-center" />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default AppProvider
