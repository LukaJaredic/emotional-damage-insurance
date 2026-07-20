import { usePolicies } from '@/api/policies'
import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { PolicyCard, policyColumns, policyFilters } from '@/components/policies'

type PolicyHolderPoliciesProps = {
  policyHolderId: string
}

function PolicyHolderPolicies({ policyHolderId }: PolicyHolderPoliciesProps) {
  return (
    <RemoteDataWithFilters
      virtualized
      className="h-full w-full"
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
  )
}

export default PolicyHolderPolicies
