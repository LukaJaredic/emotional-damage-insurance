import { useId, useState } from 'react'

import { ScrollableDialogContent } from '@/components/layout'
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

import UserForm from './user-form'

type UserFormDialogProps = {
  children: React.ReactNode
  user?: User
}

function UserFormDialog({ children, user }: UserFormDialogProps) {
  const [open, setOpen] = useState(false)
  const formId = useId()
  const isEdit = !!user

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            onSuccess={() => setOpen(false)}
          />
        </ScrollableDialogContent>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button form={formId} type="submit">
            {isEdit ? 'Save user' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UserFormDialog
