import { MinusIcon, PlusIcon } from '@phosphor-icons/react'

import { RemoteDataWithFilters } from '@/components/data/remote-data'
import { Button } from '@/components/ui/shadcn/button'
import { UserCard, userColumns, userSearchFilter } from '@/components/users'
import { usePermissions } from '@/hooks'
import type { Policy, User } from '@/types'
import { usePolicyUsers } from '@features/policies/api/get-policy-users'

import PolicyAddUsersDialog from './policy-add-users-dialog'
import PolicyRemoveUserDialog from './policy-remove-user-dialog'
import { buildPolicyUserColumns } from './policy-user-columns'

type PolicyUsersProps = {
  policy: Policy
}

function PolicyUsers({ policy }: PolicyUsersProps) {
  const { can } = usePermissions()
  const canUpdatePolicy = can('policy:update', policy)
  const canUpdateAnyUser = can('user:update', '*', '*')
  const canManagePolicyUsers = canUpdatePolicy && canUpdateAnyUser

  function renderRemoveAction(user: User) {
    if (!canUpdatePolicy || !can('user:update', user, '*')) {
      return null
    }

    return (
      <PolicyRemoveUserDialog policy={policy} user={user}>
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          aria-label="Remove user from policy"
          title="Remove user from policy"
          className="relative z-10"
        >
          <MinusIcon />
        </Button>
      </PolicyRemoveUserDialog>
    )
  }

  const tableColumns = canManagePolicyUsers
    ? buildPolicyUserColumns({ renderAction: renderRemoveAction })
    : userColumns

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      {canManagePolicyUsers ? (
        <PolicyAddUsersDialog policy={policy}>
          <Button type="button" className="sm:ml-auto sm:w-fit">
            <PlusIcon data-icon="inline-start" />
            Add users
          </Button>
        </PolicyAddUsersDialog>
      ) : null}

      <RemoteDataWithFilters
        virtualized
        className="min-h-0 w-full flex-1"
        useRemoteData={usePolicyUsers}
        baseParams={{ policyId: policy.id }}
        tableColumns={tableColumns}
        tableCaption="Policy users table"
        filters={[userSearchFilter]}
        emptyContent="No users assigned to this policy."
        loadingContent="Loading policy users..."
        errorContent="An error occurred while loading policy users. Please try again."
        listItemContent={(_, user) => (
          <UserCard
            user={user}
            action={canManagePolicyUsers ? renderRemoveAction(user) : undefined}
          />
        )}
      />
    </div>
  )
}

export default PolicyUsers
