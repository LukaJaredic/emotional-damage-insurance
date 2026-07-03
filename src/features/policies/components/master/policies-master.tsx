import { PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/shadcn/button'
import { usePermissions } from '@/hooks'
import { usePolicies } from '@features/policies/api/get-policies'
import { policyFilters } from '@features/policies/utils/policy-filters'
import { policyColumns } from '@features/policies/utils/policy-table-columns'

import PolicyCard from './policy-card'

function PoliciesMaster() {
  const { can } = usePermissions()

  return (
    <PageLayout
      heading="Policies"
      description="Browse and filter policies that are registered in the system."
      actions={() =>
        can('policy:create') ? (
          <Button>
            <PlusIcon />
            Create a policy
          </Button>
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
