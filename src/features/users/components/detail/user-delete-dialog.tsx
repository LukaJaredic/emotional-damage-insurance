import { ConfirmDialog } from '@/components/ui'
import type { User } from '@/types/user'
import { useDeleteUser } from '@features/users/api/delete-user'

type UserFormDialogProps = {
  children: React.ReactNode
  user: User | undefined
}

function UserDeleteDialog({ children, user }: UserFormDialogProps) {
  const deleteMutation = useDeleteUser()

  if (!user) {
    return null
  }

  return (
    <ConfirmDialog
      title={
        <>
          Delete{' '}
          <strong className="bg-primary px-1">
            {user.firstName} {user.lastName}
          </strong>
          ?
        </>
      }
      description="Are you sure you want to delete this user? This action cannot be undone."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={async () => deleteMutation.mutateAsync({ userId: user.id })}
    >
      {children}
    </ConfirmDialog>
  )
}

export default UserDeleteDialog
