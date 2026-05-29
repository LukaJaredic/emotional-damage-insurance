type PageLayoutProps = {
  heading: string
  description: string
  actions?: () => React.ReactNode
  children: React.ReactNode
}

/**
 * Renders a standard page layout with a heading, description, and optional actions.
 *
 * @param heading Main page heading.
 * @param description Supporting page description.
 * @param actions Optional action area rendered beside the heading.
 * @param children Main page content.
 */
function PageLayout({
  heading,
  description,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <section className="animate-page-in flex h-full min-h-0 flex-col gap-6">
      <header className="animate-fade-in-down flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="animate-fade-in-left flex flex-col gap-1 sm:ml-auto sm:flex-row">
            {actions()}
          </div>
        ) : null}
      </header>

      <div className="animate-fade-in-up flex min-h-0 flex-1">{children}</div>
    </section>
  )
}

export default PageLayout
