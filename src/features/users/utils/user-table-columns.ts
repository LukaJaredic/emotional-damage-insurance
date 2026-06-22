import { tableColumnBuilder, type TableColumn } from '@/components/data/table'
import { paths } from '@/config'
import type { User } from '@/types'

import { stringifyRoles } from './user-labels'

const tcb = tableColumnBuilder<User>()

export const userColumns: TableColumn<User>[] = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'firstName',
    getHref: (user) => paths.users.detail.getHref(user.id),
    getLabel: (user) => `${user.firstName} ${user.lastName}`,
  }),
  tcb.email('Email', 'email'),
  tcb.custom({
    title: 'Roles',
    dataIndex: 'roles',
    render: (user) => stringifyRoles(user.roles),
  }),
]
