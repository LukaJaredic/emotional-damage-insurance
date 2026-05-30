import { UsersThreeIcon, type Icon } from '@phosphor-icons/react'

import { paths } from '@/config'

export type SidebarItem = {
  title: string
  href: string
  icon: Icon
}

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Users',
    href: paths.users.getHref(),
    icon: UsersThreeIcon,
  },
]
