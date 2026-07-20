import { tableColumnBuilder, type TableColumn } from '@/components/data/table'
import { paths } from '@/config/paths'
import type { PolicyHolder } from '@/types'
import { policyHolderName, policyHolderTypeLabels } from '@/utils'

const tcb = tableColumnBuilder<PolicyHolder>()

export const policyHolderColumns: TableColumn<PolicyHolder>[] = [
  tcb.primaryLink({
    title: 'Name',
    dataIndex: 'id',
    getHref: (policyHolder) =>
      paths.policyHolders.detail.getHref(policyHolder.id),
    getLabel: policyHolderName,
  }),
  tcb.custom({
    title: 'Type',
    dataIndex: 'type',
    render: (policyHolder) => policyHolderTypeLabels[policyHolder.type],
  }),
  tcb.text('Government ID', 'governmentId'),
  tcb.email('Email', 'email'),
  tcb.phone('Phone', 'phone'),
]
