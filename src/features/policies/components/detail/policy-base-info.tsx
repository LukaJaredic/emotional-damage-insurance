import { FileTextIcon } from '@phosphor-icons/react'

import { Audit, DefinitionTermCard, Time } from '@/components/ui'
import type { Policy } from '@/types'
import { premium } from '@features/policies/utils/policy-labels'

import PolicyStatus from '../policy-status'

type PolicyBaseInfoProps = {
  policy: Policy
}

function PolicyBaseInfo({ policy }: PolicyBaseInfoProps) {
  return (
    <>
      <DefinitionTermCard
        header={
          <div className="flex items-center gap-4">
            <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-md">
              <FileTextIcon />
            </div>
            <p className="text-foreground text-base font-semibold">General</p>
          </div>
        }
        items={[
          { term: 'Status', definition: <PolicyStatus policy={policy} /> },
          { term: 'Premium', definition: premium(policy) },
          {
            term: 'Start date',
            definition: <Time date={policy.startDate} format="date" />,
          },
          {
            term: 'End date',
            definition: <Time date={policy.endDate} format="date" />,
          },
          { term: 'Policy holder ID', definition: policy.policyHolderId },
          {
            term: 'Created',
            definition: (
              <Audit userId={policy.createdBy} timestamp={policy.createdAt} />
            ),
          },
          {
            term: 'Last edited',
            definition: (
              <Audit
                userId={policy.lastEditedBy}
                timestamp={policy.lastEditedAt}
              />
            ),
          },
        ]}
      />
    </>
  )
}

export default PolicyBaseInfo
