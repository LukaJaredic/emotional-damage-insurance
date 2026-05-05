import { createContext } from 'react'
import type { ReactNode } from 'react'

export type ModalContextValue = {
  openModal: (title: string, content: ReactNode) => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined,
)
