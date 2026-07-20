import {
  ArrowCounterClockwiseIcon,
  ProhibitIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import { PageLayout } from '@/components/layout'
import { QueryLoading, Tabs } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { usePermissions } from '@/hooks'
import { toAppDate } from '@/utils/dates'
import { usePolicyDetail } from '@features/policies/api/get-policy'

import PolicyStatus from '../policy-status'

import PolicyBaseInfo from './policy-base-info'
import PolicyDeleteDialog from './policy-delete-dialog'
import PolicyLimits from './policy-limits'
import PolicyReactivateDialog from './policy-reactivate-dialog'
import PolicyTerminateDialog from './policy-terminate-dialog'
import PolicyUsers from './policy-users'

const POLICY_DETAIL_TABS_STORAGE_KEY = 'policy-detail-tabs'

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
            policy.terminated ? (
              <PolicyReactivateDialog policy={policy}>
                <Button type="button" variant="outline">
                  <ArrowCounterClockwiseIcon data-icon="inline-start" />
                  Reactivate policy
                </Button>
              </PolicyReactivateDialog>
            ) : (
              <PolicyTerminateDialog policy={policy}>
                <Button type="button" variant="outline">
                  <ProhibitIcon data-icon="inline-start" />
                  Terminate policy
                </Button>
              </PolicyTerminateDialog>
            )
          ) : null}
          {can('policy:delete', policy) ? (
            <PolicyDeleteDialog policy={policy}>
              <Button type="button" variant="destructive">
                <TrashIcon data-icon="inline-start" />
                Delete policy
              </Button>
            </PolicyDeleteDialog>
          ) : null}
        </>
      )}
    >
      <Tabs
        items={[
          {
            value: 'basic-info',
            label: 'Basic info',
            content: (
              <div className="flex min-h-min w-full flex-col gap-6 pb-10 xl:flex-row xl:items-start xl:*:basis-125">
                <PolicyBaseInfo policy={policy} />
                <PolicyLimits policy={policy} />
              </div>
            ),
          },
          {
            value: 'users',
            label: 'Users',
            content: <PolicyUsers policyId={policy.id} />,
          },
        ]}
        defaultValue="basic-info"
        storageKey={POLICY_DETAIL_TABS_STORAGE_KEY}
        ariaLabel="Policy details"
        className="min-h-0 w-full flex-1"
        tabsContentClassName="flex min-h-0 pt-4"
      />
    </PageLayout>
  )
}

export default PolicyDetail
