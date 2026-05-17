import { SignOutIcon } from '@phosphor-icons/react'
import { Navigate } from 'react-router-dom'

import Spinner from '@/components/spinner'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { paths } from '@/config/paths'
import { useUser } from '@/hooks/use-user'

type AppLayoutProps = {
  children: React.ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading, logout } = useUser()

  if (!user && !isLoading) {
    return <Navigate to={paths.auth.login.getHref(window.location.pathname)} />
  }

  return (
    <SidebarProvider>
      <div className="bg-background flex min-h-dvh w-full">
        <Sidebar collapsible="icon" className="whitespace-nowrap">
          <SidebarContent>something here</SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  title="Log out"
                  disabled={logout.isPending}
                  onClick={() => void logout.mutate()}
                >
                  {logout.isPending ? <Spinner /> : <SignOutIcon />}
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
