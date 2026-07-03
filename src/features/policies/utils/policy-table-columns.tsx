import { tableColumnBuilder, type TableColumn } from '@/components/data/table'
import { Time } from '@/components/ui'
import { paths } from '@/config'
import type { Policy } from '@/types'

import { premium, status } from './policy-labels'

const tcb = tableColumnBuilder<Policy>()

export const policyColumns: TableColumn<Policy>[] = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'name',
    getHref: (policy) => paths.policies.detail.getHref(policy.id),
    getLabel: (policy) => policy.name,
  }),
  tcb.custom({
    title: 'Status',
    dataIndex: 'terminated',
    render: status,
  }),
  tcb.custom({
    title: 'Premium',
    dataIndex: 'premium',
    render: premium,
  }),
  tcb.custom({
    title: 'Start date',
    dataIndex: 'startDate',
    render: (policy) => <Time date={policy.startDate} format="date" />,
  }),
  tcb.custom({
    title: 'End date',
    dataIndex: 'endDate',
    render: (policy) => <Time date={policy.endDate} format="date" />,
  }),
]
