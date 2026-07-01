import type { ReactNode } from 'react'

import { ConfirmDialog } from '@/components/ui'
import type { PolicyHolder } from '@/types'
import { useDeletePolicyHolder } from '@features/policy-holders/api/delete-policy-holder'
import { name } from '@features/policy-holders/utils/policy-holder-labels'

type PolicyHolderDeleteDialogProps = {
  children: ReactNode
  policyHolder: PolicyHolder | undefined
}

function PolicyHolderDeleteDialog({
  children,
  policyHolder,
}: PolicyHolderDeleteDialogProps) {
  const deleteMutation = useDeletePolicyHolder()

  if (!policyHolder) {
    return null
  }

  return (
    <ConfirmDialog
      title={
        <>
          Delete{' '}
          <strong className="bg-primary px-1">{name(policyHolder)}</strong>?
        </>
      }
      description="Are you sure you want to delete this policy holder? This action cannot be undone."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={async () =>
        deleteMutation.mutateAsync({ policyHolderId: policyHolder.id })
      }
    >
      {children}
    </ConfirmDialog>
  )
}

export default PolicyHolderDeleteDialog
