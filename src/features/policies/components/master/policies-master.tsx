import { PlusIcon } from '@phosphor-icons/react'

import { usePolicies } from '@/api/policies'
import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import { PolicyCard, policyColumns, policyFilters } from '@/components/policies'
import { Button } from '@/components/ui/shadcn/button'
import { usePermissions } from '@/hooks'
import PolicyFormDialog from '@features/policies/components/form/policy-form-dialog'

function PoliciesMaster() {
  const { can } = usePermissions()

  return (
    <PageLayout
      heading="Policies"
      description="Browse and filter policies that are registered in the system."
      actions={() =>
        can('policy:create') ? (
          <PolicyFormDialog>
            <Button>
              <PlusIcon />
              Create a policy
            </Button>
          </PolicyFormDialog>
        ) : null
      }
    >
      <RemoteDataWithFilters
        virtualized
        className="w-0"
        useRemoteData={usePolicies}
        tableColumns={policyColumns}
        tableCaption="Policies table"
        filters={policyFilters}
        emptyContent="No policies found."
        loadingContent="Loading policies..."
        errorContent="An error occurred while loading policies. Please try again."
        listItemContent={(_, policy) => <PolicyCard policy={policy} />}
      />
    </PageLayout>
  )
}

export default PoliciesMaster
