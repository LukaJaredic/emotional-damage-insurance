import type { TableColumn } from '@/components/data/table'
import type { User } from '@/types'
import { tableColumnBuilder } from '@/utils/table-columns'

const tcb = tableColumnBuilder<User>()

export const userColumns: TableColumn<User>[] = [
  tcb.text('Name', 'firstName'),
  tcb.text('Name', 'lastName'),
  tcb.email('Email', 'email'),
]
