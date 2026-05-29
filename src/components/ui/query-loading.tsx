import Spinner from './spinner'

type QueryLoadingProps = {
  label?: string
}

/**
 * Renders a shared full-container loading state for async data views.
 *
 * @param label Message shown next to the loading spinner.
 */
function QueryLoading({ label = 'Loading...' }: QueryLoadingProps) {
  return (
    <main className="flex h-full min-h-0 items-center justify-center">
      <div className="flex items-center gap-3">
        <Spinner className="size-8" />
        <span>{label}</span>
      </div>
    </main>
  )
}

export default QueryLoading
