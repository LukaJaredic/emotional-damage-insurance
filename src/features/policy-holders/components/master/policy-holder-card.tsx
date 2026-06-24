import { Link } from 'react-router'

import { paths } from '@/config'
import type { PolicyHolder } from '@/types'
import {
  name,
  typeLabels,
} from '@features/policy-holders/utils/policy-holder-labels'

type PolicyHolderProps = {
  policyHolder: PolicyHolder
}

function PolicyHolderCard({ policyHolder }: PolicyHolderProps) {
  return (
    <Link
      to={paths.policyHolders.detail.getHref(policyHolder.id)}
      className="hover:bg-accent block rounded-xl border p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-medium">{name(policyHolder)}</h2>
          <p className="text-muted-foreground text-sm">{policyHolder.email}</p>
        </div>
        <p className="text-muted-foreground text-xs uppercase">
          {typeLabels[policyHolder.type]}
        </p>
      </div>
    </Link>
  )
}

export default PolicyHolderCard
