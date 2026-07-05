import {
  ArrowCounterClockwiseIcon,
  ProhibitIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import { PageLayout } from '@/components/layout'
import { QueryLoading } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { usePermissions } from '@/hooks'
import { toAppDate } from '@/utils/dates'
import { usePolicyDetail } from '@features/policies/api/get-policy'

import PolicyStatus from '../policy-status'

import PolicyBaseInfo from './policy-base-info'
import PolicyLimits from './policy-limits'

type PolicyDetailProps = {
  policyId: string
}

function PolicyDetail({ policyId }: PolicyDetailProps) {
  const query = usePolicyDetail({ policyId })
  const { can } = usePermissions()

  if (query.isPending) {
    return <QueryLoading label="Loading policy details..." />
  }

  if (query.isError) {
    throw query.error
  }

  const policy = query.data
  const title = `${policy.name} [${toAppDate(policy.startDate)} - ${toAppDate(policy.endDate)}]`

  return (
    <PageLayout
      heading={title}
      description={<PolicyStatus policy={policy} />}
      actions={() => (
        <>
          {can('policy:update', policy, '*') ? (
            <Button type="button" variant="outline">
              {policy.terminated ? (
                <ArrowCounterClockwiseIcon data-icon="inline-start" />
              ) : (
                <ProhibitIcon data-icon="inline-start" />
              )}
              {policy.terminated ? 'Reactivate policy' : 'Terminate policy'}
            </Button>
          ) : null}
          {can('policy:delete', policy) ? (
            <Button type="button" variant="destructive">
              <TrashIcon data-icon="inline-start" />
              Delete policy
            </Button>
          ) : null}
        </>
      )}
    >
      <div className="flex min-h-min w-full flex-col gap-6 pb-10 xl:flex-row xl:items-start xl:*:basis-125">
        <PolicyBaseInfo policy={policy} />
        <PolicyLimits policy={policy} />
      </div>
    </PageLayout>
  )
}

export default PolicyDetail
