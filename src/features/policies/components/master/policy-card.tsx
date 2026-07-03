import { Link } from 'react-router'

import { Time } from '@/components/ui'
import { paths } from '@/config'
import type { Policy } from '@/types'
import { premium, status } from '@features/policies/utils/policy-labels'

type PolicyCardProps = {
  policy: Policy
}

function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <Link
      to={paths.policies.detail.getHref(policy.id)}
      className="hover:bg-accent block rounded-xl border p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate font-medium">{policy.name}</h2>
          <p className="text-muted-foreground truncate text-sm">
            <span>{premium(policy)}</span>
            <div className="flex gap-2">
              <Time date={policy.startDate} format="date" />
              -
              <Time date={policy.endDate} format="date" />
            </div>
          </p>
        </div>
        <p className="text-muted-foreground text-xs uppercase">
          {status(policy)}
        </p>
      </div>
    </Link>
  )
}

export default PolicyCard
