import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router'

import { Toaster } from '@/components/ui/shadcn/sonner'
import { TooltipProvider } from '@/components/ui/shadcn/tooltip'
import { queryClient } from '@/lib'

import PermissionsProvider from './permissions-provider'
import UserProvider from './user-provider'

function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <PermissionsProvider>
            <Outlet />
            <Toaster richColors position="top-center" />
          </PermissionsProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default AppProvider
