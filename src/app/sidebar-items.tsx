import { HouseIcon, UsersThreeIcon, type Icon } from '@phosphor-icons/react'

import { paths } from '@/config'

export type SidebarItem = {
  title: string
  href: string
  icon: Icon
}

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Home',
    href: paths.root.getHref(),
    icon: HouseIcon,
  },
  {
    title: 'Users',
    href: paths.users.getHref(),
    icon: UsersThreeIcon,
  },
]
