import { SignOutIcon } from '@phosphor-icons/react'
import { NavLink, Navigate } from 'react-router-dom'

import { sidebarItems } from '@/app/sidebar-items'
import { Spinner } from '@/components/ui'
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
} from '@/components/ui/shadcn/sidebar'
import { paths } from '@/config'
import { useUser } from '@/hooks'

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
          <SidebarContent className="pt-14">
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton className="rounded-none! py-3" asChild>
                      <NavLink to={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
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
          <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
