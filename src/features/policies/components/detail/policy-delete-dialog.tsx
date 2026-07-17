import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/ui'
import type { Policy } from '@/types'
import { useDeletePolicy } from '@features/policies/api/delete-policy'

type PolicyDeleteDialogProps = {
  children: ReactNode
  policy: Policy
}

function PolicyDeleteDialog({ children, policy }: PolicyDeleteDialogProps) {
  const deleteMutation = useDeletePolicy()

  return (
    <ConfirmDialog
      title={
        <>
          Delete <strong className="bg-primary px-1">{policy.name}</strong>?
        </>
      }
      description="Are you sure you want to delete this policy? This action cannot be undone."
      confirmLabel="Delete policy"
      variant="destructive"
      onConfirm={() => deleteMutation.mutateAsync({ policyId: policy.id })}
    >
      {children}
    </ConfirmDialog>
  )
}

export default PolicyDeleteDialog
