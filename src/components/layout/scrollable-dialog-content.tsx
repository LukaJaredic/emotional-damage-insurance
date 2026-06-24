import type { ReactNode } from 'react'

type ScrollableDialogContentProps = {
  children: ReactNode
}

/**
 * Renders scrollable dialog content with shared spacing and borders.
 *
 * @param children Content rendered inside the scrollable area.
 */
function ScrollableDialogContent({ children }: ScrollableDialogContentProps) {
  return (
    <div className="-mx-6 max-h-[calc(100vh-250px)] overflow-y-auto border-y px-6 py-4">
      {children}
    </div>
  )
}

export default ScrollableDialogContent
