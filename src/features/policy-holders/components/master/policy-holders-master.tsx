import { PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PageLayout } from '@/components/layout'
import { Button } from '@/components/ui/shadcn/button'
import { usePermissions } from '@/hooks'
import { usePolicyHolders } from '@features/policy-holders/api/get-policy-holders'
import { policyHolderFilters } from '@features/policy-holders/utils/policy-holder-filters'
import { policyHolderColumns } from '@features/policy-holders/utils/policy-holder-table-columns'

import PolicyHolderFormDialog from '../form/policy-holder-form-dialog'

import PolicyHolderCard from './policy-holder-card'

function PolicyHoldersMaster() {
  const { can } = usePermissions()

  return (
    <PageLayout
      heading="Policy holders"
      description="Browse and filter policy holders that are registered in the system."
      actions={() =>
        can('policy-holder:create') ? (
          <PolicyHolderFormDialog>
            <Button>
              <PlusIcon />
              Create a policy holder
            </Button>
          </PolicyHolderFormDialog>
        ) : null
      }
    >
      <RemoteDataWithFilters
        useRemoteData={usePolicyHolders}
        tableColumns={policyHolderColumns}
        tableCaption="Policy holders table"
        filters={policyHolderFilters}
        emptyContent="No policy holders found."
        loadingContent="Loading policy holders..."
        errorContent="An error occurred while loading policy holders. Please try again."
        listItemContent={(_, policyHolder) => (
          <PolicyHolderCard policyHolder={policyHolder} />
        )}
      />
    </PageLayout>
  )
}

export default PolicyHoldersMaster
