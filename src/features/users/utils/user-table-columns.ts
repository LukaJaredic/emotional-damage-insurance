import type { TableColumn } from '@/components/data/table'
import { paths } from '@/config'
import type { User } from '@/types'
import { tableColumnBuilder } from '@/utils/table-columns'

const tcb = tableColumnBuilder<User>()

export const userColumns: TableColumn<User>[] = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'firstName',
    getHref: (user) => paths.users.getDetailHref(user.id),
    getLabel: (user) => `${user.firstName} ${user.lastName}`,
  }),
  tcb.email('Email', 'email'),
  tcb.array('Roles', 'roles'),
]
