import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog'

import { ModalContext } from './modal-context'

type ModalState = {
  title: string
  content: React.ReactNode
}

type ModalProviderProps = {
  children: React.ReactNode
}

function ModalProvider({ children }: ModalProviderProps) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const openModal = (title: string, content: React.ReactNode) => {
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

export default ModalProvider
