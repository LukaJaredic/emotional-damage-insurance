import { createContext } from 'react'

export type ModalContextValue = {
  openModal: (title: string, content: React.ReactNode) => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined,
)
