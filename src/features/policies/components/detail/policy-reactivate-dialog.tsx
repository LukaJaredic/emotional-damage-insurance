import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/ui'
import type { Policy } from '@/types'
import { useReactivatePolicy } from '@features/policies/api/reactivate-policy'

type PolicyReactivateDialogProps = {
  children: ReactNode
  policy: Policy
}

function PolicyReactivateDialog({
  children,
  policy,
}: PolicyReactivateDialogProps) {
  const reactivateMutation = useReactivatePolicy()

  return (
    <ConfirmDialog
      title={
        <>
          Reactivate <strong className="bg-primary px-1">{policy.name}</strong>?
        </>
      }
      description="Reactivate this policy to make it active again for future policy operations."
      confirmLabel="Reactivate policy"
      onConfirm={() => reactivateMutation.mutateAsync({ policyId: policy.id })}
    >
      {children}
    </ConfirmDialog>
  )
}

export default PolicyReactivateDialog
