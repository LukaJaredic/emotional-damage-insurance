import { BriefcaseIcon, UsersThreeIcon, type Icon } from '@phosphor-icons/react'

import { paths } from '@/config'
import type { PageAccess } from '@/utils'

export type SidebarItem = {
  title: string
  href: string
  icon: Icon
  access: PageAccess
}

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Users',
    href: paths.users.getHref(),
    icon: UsersThreeIcon,
    access: 'users:master-page',
  },
  {
    title: 'Policy Holders',
    href: paths.policyHolders.getHref(),
    icon: BriefcaseIcon,
    access: 'policy-holders:master-page',
  },
]
