import type { ReactNode } from 'react'

import { tableColumnBuilder, type TableColumn } from '@/components/data/table'
import { userColumns } from '@/components/users'
import type { User } from '@/types'

const tcb = tableColumnBuilder<User>()

type PolicyUserColumnsOptions = {
  renderAction: (user: User) => ReactNode
}

function buildPolicyUserColumns({
  renderAction,
}: PolicyUserColumnsOptions): TableColumn<User>[] {
  return [
    tcb.action({
      dataIndex: 'id',
      render: renderAction,
    }),
    ...userColumns,
  ]
}

export { buildPolicyUserColumns }
