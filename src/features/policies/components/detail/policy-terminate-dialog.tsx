import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/ui'
import type { Policy } from '@/types'
import { useTerminatePolicy } from '@features/policies/api/terminate-policy'

type PolicyTerminateDialogProps = {
  children: ReactNode
  policy: Policy
}

function PolicyTerminateDialog({
  children,
  policy,
}: PolicyTerminateDialogProps) {
  const terminateMutation = useTerminatePolicy()

  return (
    <ConfirmDialog
      title={
        <>
          Terminate <strong className="bg-primary px-1">{policy.name}</strong>?
        </>
      }
      description="Are you sure you want to terminate this policy? The policy will no longer be active until it is reactivated."
      confirmLabel="Terminate policy"
      variant="destructive"
      onConfirm={() => terminateMutation.mutateAsync({ policyId: policy.id })}
    >
      {children}
    </ConfirmDialog>
  )
}

export default PolicyTerminateDialog
