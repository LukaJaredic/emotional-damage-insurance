import type { ReactNode } from 'react'

import { useDisconnectPolicyUser } from '@/api/policies'
import { ConfirmDialog } from '@/components/ui'
import type { Policy, User } from '@/types'

type PolicyRemoveUserDialogProps = {
  policy: Policy
  user: User
  children: ReactNode
}

function PolicyRemoveUserDialog({
  policy,
  user,
  children,
}: PolicyRemoveUserDialogProps) {
  const mutation = useDisconnectPolicyUser()

  return (
    <ConfirmDialog
      title="Remove user from policy?"
      description={
        <>
          This will remove{' '}
          <strong className="bg-primary text-foreground px-1">
            {user.firstName} {user.lastName}
          </strong>{' '}
          from{' '}
          <strong className="bg-destructive text-background px-1">
            {policy.name}
          </strong>
          .
          <br /> Coverage limits from this policy will no longer apply to this
          user.
        </>
      }
      confirmLabel="Remove user"
      variant="destructive"
      onConfirm={() =>
        mutation.mutateAsync({ policyId: policy.id, userId: user.id })
      }
    >
      {children}
    </ConfirmDialog>
  )
}

export default PolicyRemoveUserDialog
