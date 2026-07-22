import { PlusIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'

import { useConnectPolicyUser } from '@/api/policies'
import { RemoteData } from '@/components/data/remote-data'
import { Filters } from '@/components/form'
import { Button } from '@/components/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/shadcn/dialog'
import { UserCard, userSearchFilter } from '@/components/users'
import { usePermissions } from '@/hooks'
import type { Policy, User } from '@/types'
import { useNotConnectedPolicyUsers } from '@features/policies/api/get-not-connected-policy-users'

import { buildPolicyUserColumns } from './policy-user-columns'

type PolicyAddUsersDialogProps = {
  policy: Policy
  children: ReactNode
}

type AddUsersFilterValues = {
  search: string
}

const defaultFilterValues: AddUsersFilterValues = {
  search: '',
}

function PolicyAddUsersDialog({ policy, children }: PolicyAddUsersDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add users to policy</DialogTitle>
          <DialogDescription>
            Search available users and connect them to {policy.name}. Connected
            users remain visible in the policy &quot;Users&quot; tab.
          </DialogDescription>
        </DialogHeader>

        <NotConnectedUsers policy={policy} />

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

function NotConnectedUsers({ policy }: { policy: Policy }) {
  const { can } = usePermissions()
  const [filters, setFilters] =
    useState<AddUsersFilterValues>(defaultFilterValues)
  const query = useNotConnectedPolicyUsers({
    policyId: policy.id,
    search: filters.search,
  })
  const mutation = useConnectPolicyUser()

  function renderAddAction(user: User) {
    if (!can('policy:update', policy) || !can('user:update', user, '*')) {
      return null
    }

    return (
      <Button
        type="button"
        size="icon-xs"
        variant="outline"
        aria-label="Add user to policy"
        title="Add user to policy"
        className="relative z-10 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950/40"
        disabled={mutation.isPending}
        onClick={() =>
          mutation.mutate({ policyId: policy.id, userId: user.id })
        }
      >
        <PlusIcon />
      </Button>
    )
  }

  const tableColumns = buildPolicyUserColumns({ renderAction: renderAddAction })

  return (
    <div className="flex h-[min(70vh,40rem)] min-h-0 flex-col gap-4">
      <Filters
        filters={[userSearchFilter]}
        defaultValues={defaultFilterValues}
        onChange={setFilters}
      />

      <div className="min-h-0 flex-1">
        <RemoteData
          virtualized
          className="h-full w-full"
          query={query}
          tableColumns={tableColumns}
          tableCaption="Available users table"
          emptyContent="No available users found for this policy."
          loadingContent="Loading available users..."
          errorContent="An error occurred while loading available users. Please try again."
          listItemContent={(_, user) => (
            <UserCard user={user} action={renderAddAction(user)} />
          )}
        />
      </div>
    </div>
  )
}

export default PolicyAddUsersDialog
