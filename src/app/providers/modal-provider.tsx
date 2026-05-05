import { useState } from 'react'
import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ModalContext } from '@app/providers/modal-context'

type ModalState = {
  title: string
  content: ReactNode
}

type ModalProviderProps = {
  children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openModal = (title: string, content: ReactNode) => {
    setModal({ title, content })
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal?.title}</DialogTitle>
          </DialogHeader>
          {modal?.content}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  )
}
