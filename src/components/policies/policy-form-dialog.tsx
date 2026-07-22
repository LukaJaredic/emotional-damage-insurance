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

import PolicyForm from './policy-form'
import type {
  PolicyFormDefaultValues,
  PolicyFormStatus,
} from './policy-form.types'

type PolicyFormDialogProps = {
  children: ReactNode
  defaultValues?: PolicyFormDefaultValues | undefined
}

type PolicyFormDialogStatus = Exclude<PolicyFormStatus, 'success'> | 'closed'

function PolicyFormDialog({ children, defaultValues }: PolicyFormDialogProps) {
  const [status, setStatus] = useState<PolicyFormDialogStatus>('closed')
  const formId = useId()
  const isPending = status === 'pending'

  function handleOpenChange(nextOpen: boolean) {
    if (isPending && !nextOpen) {
      return
    }

    setStatus(nextOpen ? 'idle' : 'closed')
  }

  function handleStatusChange(nextStatus: PolicyFormStatus) {
    if (nextStatus === 'success') {
      setStatus('closed')
    } else {
      setStatus(nextStatus)
    }
  }

  return (
    <Dialog open={status !== 'closed'} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Create a policy</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new policy.
          </DialogDescription>
        </DialogHeader>
        <ScrollableDialogContent>
          <PolicyForm
            id={formId}
            showSubmit={false}
            defaultValues={defaultValues}
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
            Create policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PolicyFormDialog
