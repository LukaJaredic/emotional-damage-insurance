import { PencilIcon, TrashIcon } from '@phosphor-icons/react'

import { PageLayout } from '@/components/layout'
import { QueryLoading } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import usePermissions from '@/hooks/use-permissions'
import { usePolicyHolderDetail } from '@features/policy-holders/api/get-policy-holder'
import { name } from '@features/policy-holders/utils/policy-holder-labels'

import PolicyHolderFormDialog from '../form/policy-holder-form-dialog'

import PolicyHolderBaseInfo from './policy-holder-base-info'
import PolicyHolderDeleteDialog from './policy-holder-delete-dialog'

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
      heading={name(policyHolder)}
      description={policyHolder.email}
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
      <div className="flex min-h-0 w-full flex-col gap-6 xl:flex-row xl:items-start xl:*:first:basis-125">
        <PolicyHolderBaseInfo policyHolder={policyHolder} />
      </div>
    </PageLayout>
  )
}

export default PolicyHolderDetail
