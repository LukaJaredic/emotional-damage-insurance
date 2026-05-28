type ScrollableDialogContentProps = {
  children: React.ReactNode
}

function ScrollableDialogContent({ children }: ScrollableDialogContentProps) {
  return (
    <div className="-mx-6 max-h-[calc(100vh-250px)] overflow-y-auto border-y px-6 py-4">
      {children}
    </div>
  )
}

export default ScrollableDialogContent
