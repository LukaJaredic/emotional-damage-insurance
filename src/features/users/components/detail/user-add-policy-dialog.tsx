import { useId, useState, type ReactNode } from 'react'

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
import type { User } from '@/types'

import UserAddPolicyForm, {
  type UserAddPolicyFormStatus,
} from './user-add-policy-form'

type DialogStatus = Exclude<UserAddPolicyFormStatus, 'success'> | 'closed'

type UserAddPolicyDialogProps = {
  user: User
  children: ReactNode
}

function UserAddPolicyDialog({ user, children }: UserAddPolicyDialogProps) {
  const [status, setStatus] = useState<DialogStatus>('closed')
  const formId = useId()
  const isPending = status === 'pending'

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) {
      return
    }

    setStatus(nextOpen ? 'idle' : 'closed')
  }

  function handleStatusChange(nextStatus: UserAddPolicyFormStatus) {
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
          <DialogTitle>Add policy to user</DialogTitle>
          <DialogDescription>
            Choose an available policy to connect to this user.
          </DialogDescription>
        </DialogHeader>
        <UserAddPolicyForm
          id={formId}
          user={user}
          showSubmit={false}
          onStatusChange={handleStatusChange}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button form={formId} type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            Add policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserAddPolicyDialog
