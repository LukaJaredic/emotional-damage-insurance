type MasterPageLayoutProps = {
  heading: string
  description: string
  actions?: () => React.ReactNode
  children: React.ReactNode
}

function MasterPageLayout({
  heading,
  description,
  actions,
  children,
}: MasterPageLayoutProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex flex-col gap-1 sm:ml-auto sm:flex-row">
            {actions()}
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">{children}</div>
    </section>
  )
}

export default MasterPageLayout
