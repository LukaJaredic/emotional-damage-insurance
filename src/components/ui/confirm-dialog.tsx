import { useState, type ReactNode } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/shadcn/alert-dialog'

import Spinner from './spinner'

type ConfirmDialogStatus = 'closed' | 'idle' | 'pending'

type ConfirmDialogProps = {
  children: ReactNode
  title: ReactNode
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => Promise<unknown> | unknown
}

/**
 * Renders a confirmation dialog around a trigger element.
 *
 * @param onConfirm Callback invoked when the confirm action is pressed.
 * @param children Trigger element that opens the dialog.
 * @param title Dialog title content.
 * @param description Dialog description content.
 * @param confirmLabel Label shown on the confirm action.
 * @param cancelLabel Label shown on the cancel action.
 * @param variant Visual style applied to the confirm action (one of: 'default', 'destructive').
 */
function ConfirmDialog({
  children,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [status, setStatus] = useState<ConfirmDialogStatus>('closed')
  const open = status !== 'closed'
  const isPending = status === 'pending'

  async function handleConfirm() {
    setStatus('pending')

    try {
      await onConfirm()
      setStatus('closed')
    } catch {
      setStatus('idle')
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setStatus(nextOpen ? 'idle' : 'closed')
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
          >
            {isPending ? <Spinner /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
