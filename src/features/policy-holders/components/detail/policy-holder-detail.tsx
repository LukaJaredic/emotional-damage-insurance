import { PencilIcon, TrashIcon } from '@phosphor-icons/react'

import { usePolicyHolderDetail } from '@/api/policy-holders'
import { PageLayout } from '@/components/layout'
import { QueryLoading, Tabs } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import usePermissions from '@/hooks/use-permissions'
import { policyHolderName, policyHolderTypeLabels } from '@/utils'

import PolicyHolderFormDialog from '../form/policy-holder-form-dialog'

import PolicyHolderBaseInfo from './policy-holder-base-info'
import PolicyHolderDeleteDialog from './policy-holder-delete-dialog'
import PolicyHolderPolicies from './policy-holder-policies'

const POLICY_HOLDER_DETAIL_TABS_STORAGE_KEY = 'policy-holder-detail-tabs'

type PolicyHolderDetailProps = {
  policyHolderId: string
}

function PolicyHolderDetail({ policyHolderId }: PolicyHolderDetailProps) {
  const query = usePolicyHolderDetail({ policyHolderId })
  const { can } = usePermissions()

  if (query.isPending) {
    return <QueryLoading label="Loading policy holder details..." />
  }

  if (query.isError) {
    throw query.error
  }

  const policyHolder = query.data

  return (
    <PageLayout
      heading={policyHolderName(policyHolder)}
      description={policyHolderTypeLabels[policyHolder.type]}
      actions={() => (
        <>
          {can('policy-holder:update', policyHolder, '*') ? (
            <PolicyHolderFormDialog policyHolder={policyHolder}>
              <Button>
                <PencilIcon /> Edit policy holder
              </Button>
            </PolicyHolderFormDialog>
          ) : null}
          {can('policy-holder:delete', policyHolder) ? (
            <PolicyHolderDeleteDialog policyHolder={policyHolder}>
              <Button variant="destructive">
                <TrashIcon />
                Delete policy holder
              </Button>
            </PolicyHolderDeleteDialog>
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
              <div className="flex min-h-0 w-full flex-col gap-6 xl:flex-row xl:items-start xl:*:first:basis-125">
                <PolicyHolderBaseInfo policyHolder={policyHolder} />
              </div>
            ),
          },
          {
            value: 'policies',
            label: 'Policies',
            content: <PolicyHolderPolicies policyHolderId={policyHolder.id} />,
          },
        ]}
        defaultValue="basic-info"
        storageKey={POLICY_HOLDER_DETAIL_TABS_STORAGE_KEY}
        ariaLabel="Policy holder details"
        className="min-h-0 w-full flex-1"
        tabsContentClassName="flex min-h-0 pt-4"
      />
    </PageLayout>
  )
}

export default PolicyHolderDetail
