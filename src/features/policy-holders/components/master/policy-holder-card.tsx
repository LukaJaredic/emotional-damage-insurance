import { Link } from 'react-router'

import { paths } from '@/config'
import type { PolicyHolder } from '@/types'
import { policyHolderName, policyHolderTypeLabels } from '@/utils'

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
        <div className="min-w-0 space-y-1">
          <h2 className="truncate font-medium">
            {policyHolderName(policyHolder)}
          </h2>
          <p className="text-muted-foreground truncate text-sm">
            {policyHolder.email}
          </p>
        </div>
        <p className="text-muted-foreground text-xs uppercase">
          {policyHolderTypeLabels[policyHolder.type]}
        </p>
      </div>
    </Link>
  )
}

export default PolicyHolderCard
