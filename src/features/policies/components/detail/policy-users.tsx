import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { UserCard, userColumns, userSearchFilter } from '@/components/users'
import { usePolicyUsers } from '@features/policies/api/get-policy-users'

type PolicyUsersProps = {
  policyId: string
}

function PolicyUsers({ policyId }: PolicyUsersProps) {
  return (
    <RemoteDataWithFilters
      virtualized
      className="h-full w-full"
      useRemoteData={usePolicyUsers}
      baseParams={{ policyId }}
      tableColumns={userColumns}
      tableCaption="Policy users table"
      filters={[userSearchFilter]}
      emptyContent="No users assigned to this policy."
      loadingContent="Loading policy users..."
      errorContent="An error occurred while loading policy users. Please try again."
      listItemContent={(_, user) => <UserCard user={user} />}
    />
  )
}

export default PolicyUsers
