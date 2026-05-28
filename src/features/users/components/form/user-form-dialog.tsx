import { useId, useState } from 'react'

import { ScrollableDialogContent } from '@/components/layout'
import { Spinner } from '@/components/ui'
import Button from '@/components/ui/shadcn/button'
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
import type { UserFormStatus } from '@features/users/types/user-form.types'

import UserForm from './user-form'

type UserFormDialogProps = {
  children: React.ReactNode
  user?: User
}

type DialogState =
  | {
      open: true
      status: 'idle' | 'pending'
    }
  | {
      open: false
      status: 'idle' | 'success'
    }

function UserFormDialog({ children, user }: UserFormDialogProps) {
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    status: 'idle',
  })
  const formId = useId()
  const isEdit = !!user
  const isPending = dialog.status === 'pending'

  function handleOpenChange(nextOpen: boolean) {
    setDialog({ open: nextOpen, status: 'idle' })
  }

  function handleStatusChange(nextStatus: UserFormStatus) {
    if (nextStatus === 'success') {
      setDialog({ open: false, status: 'success' })
    } else {
      setDialog({ open: true, status: nextStatus })
    }
  }

  return (
    <Dialog open={dialog.open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `${user.firstName} ${user.lastName}` : 'Create a user'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the user details and save your changes.'
              : 'Fill in the details below to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollableDialogContent>
          <UserForm
            id={formId}
            user={user}
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
            {isEdit ? 'Save user' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserFormDialog
