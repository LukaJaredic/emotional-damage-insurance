import { SidebarSimpleIcon } from '@phosphor-icons/react'
import { Slot } from 'radix-ui'
import { createContext, useContext, useState } from 'react'

import Button from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar: () => setOpen((current) => !current),
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }

  return context
}

function Sidebar({
  className,
  children,
}: React.ComponentProps<'aside'> & {
  collapsible?: 'icon' | 'offcanvas' | 'none'
}) {
  const { open } = useSidebar()

  return (
    <aside
      data-slot="sidebar"
      data-state={open ? 'expanded' : 'collapsed'}
      className={cn(
        'group/sidebar bg-sidebar text-sidebar-foreground hidden min-h-dvh border-r transition-[width] duration-200 md:flex md:flex-col',
        open ? 'w-64' : 'w-18',
        className,
      )}
    >
      {children}
    </aside>
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn('flex-1 overflow-auto', className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('border-t p-2', className)}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn('flex min-h-dvh min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  )
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={toggleSidebar}
      {...props}
    >
      <SidebarSimpleIcon />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="sidebar-menu-item" className={className} {...props} />
}

function SidebarMenuButton({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="sidebar-menu-button"
      className={cn(
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
        'group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0',
        'group-data-[state=collapsed]/sidebar:[&_span]:hidden',
        className,
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
}
