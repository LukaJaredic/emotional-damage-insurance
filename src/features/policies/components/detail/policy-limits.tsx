import { GaugeIcon } from '@phosphor-icons/react'

import { DefinitionTermCard } from '@/components/ui'
import type { Policy, PolicyLimits as PolicyLimitsType } from '@/types'
import { toEur } from '@/utils/currency'
import { limitLabels } from '@features/policies/utils/policy-labels'

type PolicyLimitsProps = {
  policy: Policy
}

function PolicyLimits({ policy }: PolicyLimitsProps) {
  return (
    <DefinitionTermCard
      header={
        <div className="flex items-center gap-4">
          <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-md">
            <GaugeIcon />
          </div>
          <p className="text-foreground text-base font-semibold">Limits</p>
        </div>
      }
      items={(Object.keys(limitLabels) as (keyof PolicyLimitsType)[]).map(
        (limit) => ({
          term: limitLabels[limit],
          definition: toEur(policy.limits[limit]),
        }),
      )}
    />
  )
}

export default PolicyLimits
