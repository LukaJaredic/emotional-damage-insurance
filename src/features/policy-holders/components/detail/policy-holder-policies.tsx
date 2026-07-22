import { PlusIcon } from '@phosphor-icons/react'

import { usePolicies } from '@/api/policies'
import { RemoteDataWithFilters } from '@/components/data/remote-data'
import {
  PolicyCard,
  PolicyFormDialog,
  policyColumns,
  policyFilters,
} from '@/components/policies'
import { Button } from '@/components/ui/shadcn/button'
import usePermissions from '@/hooks/use-permissions'

type PolicyHolderPoliciesProps = {
  policyHolderId: string
}

function PolicyHolderPolicies({ policyHolderId }: PolicyHolderPoliciesProps) {
  const { can } = usePermissions()

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      {can('policy:create') ? (
        <PolicyFormDialog defaultValues={{ policyHolderId }}>
          <Button className="shrink-0 sm:ml-auto sm:w-fit">
            <PlusIcon />
            Add policy
          </Button>
        </PolicyFormDialog>
      ) : null}
      <RemoteDataWithFilters
        virtualized
        className="min-h-0 w-full flex-1"
        useRemoteData={usePolicies}
        baseParams={{ policyHolderId }}
        tableColumns={policyColumns}
        tableCaption="Policies table"
        filters={policyFilters}
        emptyContent="No policies found for this policy holder."
        loadingContent="Loading policies..."
        errorContent="An error occurred while loading policies. Please try again."
        listItemContent={(_, policy) => <PolicyCard policy={policy} />}
      />
    </div>
  )
}

export default PolicyHolderPolicies
