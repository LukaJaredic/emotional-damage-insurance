import { useId, useState, type ReactNode } from 'react'

import { ScrollableDialogContent } from '@/components/layout'
import { Spinner } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/shadcn/dialog'
import type { PolicyHolder } from '@/types'
import type { PolicyHolderFormStatus } from '@features/policy-holders/types/policy-holder-form.types'
import { name } from '@features/policy-holders/utils/policy-holder-labels'

import PolicyHolderForm from './policy-holder-form'

type PolicyHolderFormDialogProps = {
  children: ReactNode
  policyHolder?: PolicyHolder | undefined
}

type PolicyHolderFormDialogStatus =
  | Exclude<PolicyHolderFormStatus, 'success'>
  | 'closed'

function PolicyHolderFormDialog({
  children,
  policyHolder,
}: PolicyHolderFormDialogProps) {
  const [status, setStatus] = useState<PolicyHolderFormDialogStatus>('closed')
  const formId = useId()
  const isEdit = !!policyHolder
  const isPending = status === 'pending'

  function handleOpenChange(nextOpen: boolean) {
    setStatus(nextOpen ? 'idle' : 'closed')
  }

  function handleStatusChange(nextStatus: PolicyHolderFormStatus) {
    if (nextStatus === 'success') {
      setStatus('closed')
    } else {
      setStatus(nextStatus)
    }
  }

  return (
    <Dialog open={status !== 'closed'} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? name(policyHolder) : 'Create a policy holder'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the policy holder details and save your changes.'
              : 'Fill in the details below to create a new policy holder.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollableDialogContent>
          <PolicyHolderForm
            id={formId}
            policyHolder={policyHolder}
            showSubmit={false}
            onStatusChange={handleStatusChange}
          />
        </ScrollableDialogContent>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            {isEdit ? 'Save policy holder' : 'Create policy holder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PolicyHolderFormDialog
