import { FileTextIcon } from '@phosphor-icons/react'
import { Link } from 'react-router'

import { usePolicyHolderDetail } from '@/api'
import { PolicyStatus } from '@/components/policies'
import { Audit, DefinitionTermCard, Time } from '@/components/ui'
import { paths } from '@/config'
import type { Policy } from '@/types'
import { policyHolderName, policyPremium } from '@/utils'

type PolicyBaseInfoProps = {
  policy: Policy
}

function PolicyBaseInfo({ policy }: PolicyBaseInfoProps) {
  return (
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
        { term: 'Premium', definition: policyPremium(policy) },
        {
          term: 'Start date',
          definition: <Time date={policy.startDate} format="date" />,
        },
        {
          term: 'End date',
          definition: <Time date={policy.endDate} format="date" />,
        },
        {
          term: 'Policy holder',
          definition: (
            <PolicyHolderName policyHolderId={policy.policyHolderId} />
          ),
        },
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
  )
}

function PolicyHolderName({ policyHolderId }: { policyHolderId: string }) {
  const query = usePolicyHolderDetail({ policyHolderId })

  if (query.isPending) {
    return 'Loading policy holder...'
  }

  if (query.isError) {
    return policyHolderId
  }

  return (
    <Link
      className="underline"
      to={paths.policyHolders.detail.getHref(policyHolderId)}
    >
      {policyHolderName(query.data)}
    </Link>
  )
}

export default PolicyBaseInfo
