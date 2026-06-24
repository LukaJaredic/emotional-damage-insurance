import { tableColumnBuilder, type TableColumn } from '@/components/data/table'
import { paths } from '@/config/paths'
import type { PolicyHolder } from '@/types'

import { name, typeLabels } from './policy-holder-labels'

const tcb = tableColumnBuilder<PolicyHolder>()

export const policyHolderColumns: TableColumn<PolicyHolder>[] = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'id',
    getHref: (policyHolder) =>
      paths.policyHolders.detail.getHref(policyHolder.id),
    getLabel: name,
  }),
  tcb.custom({
    title: 'Type',
    dataIndex: 'type',
    render: (policyHolder) => typeLabels[policyHolder.type],
  }),
  tcb.text('Government ID', 'governmentId'),
  tcb.email('Email', 'email'),
  tcb.phone('Phone', 'phone'),
]
