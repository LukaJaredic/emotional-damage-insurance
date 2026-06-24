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
import type { User } from '@/types'
import type { UserFormStatus } from '@features/users/types/user-form.types'

import UserForm from './user-form'

type UserFormDialogProps = {
  children: ReactNode
  user?: User | undefined
}

type UserFormDialogStatus = Omit<UserFormStatus, 'success'> | 'closed'

function UserFormDialog({ children, user }: UserFormDialogProps) {
  const [status, setStatus] = useState<UserFormDialogStatus>('closed')
  const formId = useId()
  const isEdit = !!user
  const isPending = status === 'pending'

  function handleOpenChange(nextOpen: boolean) {
    setStatus(nextOpen ? 'idle' : 'closed')
  }

  function handleStatusChange(nextStatus: UserFormStatus) {
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
