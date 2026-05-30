import { SignOutIcon } from '@phosphor-icons/react'
import { NavLink, Navigate } from 'react-router-dom'

import { sidebarItems, type SidebarItem } from '@/app/sidebar-items'
import { Logo, Spinner } from '@/components/ui'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
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
        <Sidebar
          collapsible="icon"
          className="animate-fade-in-right stagger-self-2 whitespace-nowrap"
        >
          <SidebarHeader className="border-b p-0">
            <SidebarMenu>
              <SidebarHeaderItem />
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="border-b pt-1">
            <SidebarMenu className="stagger-items-1">
              {sidebarItems.map((item) => (
                <SidebarItem item={item} key={item.href} />
              ))}
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
          <header className="animate-fade-in-down stagger-self-2 flex h-14 items-center border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="min-h-0 flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout

function SidebarItem({ item }: { item: SidebarItem }) {
  const { openMobile, setOpenMobile } = useSidebar()

  const Icon = item.icon

  function closeMobileSidebar() {
    if (openMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem className="animate-fade-in-right">
      <SidebarMenuButton className="rounded-none! py-3" asChild>
        <NavLink to={item.href} onClick={closeMobileSidebar}>
          <Icon />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarHeaderItem() {
  const { openMobile, setOpenMobile } = useSidebar()

  function closeMobileSidebar() {
    if (openMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarMenuItem className="animate-fade-in-right">
      <SidebarMenuButton className="h-13.75 rounded-none!" asChild>
        <NavLink to={paths.root.getHref()} onClick={closeMobileSidebar}>
          <Logo />
          <span>Emotional Damage Inc</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
