import type { ReactNode } from 'react'

import { useDisconnectPolicyUser } from '@/api/policies'
import { ConfirmDialog } from '@/components/ui'
import type { PolicyWithUserLimits, User } from '@/types'

type UserRemovePolicyDialogProps = {
  user: User
  policy: PolicyWithUserLimits
  children: ReactNode
}

function UserRemovePolicyDialog({
  user,
  policy,
  children,
}: UserRemovePolicyDialogProps) {
  const mutation = useDisconnectPolicyUser()

  return (
    <ConfirmDialog
      title="Remove policy from user?"
      description={`This will remove ${policy.name} from ${user.firstName} ${user.lastName}. Coverage limits from this policy will no longer apply to this user.`}
      confirmLabel="Remove policy"
      variant="destructive"
      onConfirm={() =>
        mutation.mutateAsync({ policyId: policy.id, userId: user.id })
      }
    >
      {children}
    </ConfirmDialog>
  )
}

export default UserRemovePolicyDialog
