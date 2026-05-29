import {
  ArrowLeftIcon,
  CircleNotchIcon,
  HouseIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'

import { paths } from '@/config'

import Button from './shadcn/button'

type QueryErrorProps = {
  title?: string
  description?: string
}

/**
 * Renders a shared full-container error state for failed data loading.
 *
 * @param title Heading shown in the error state.
 * @param description Supporting message shown below the heading.
 */
function QueryError({
  title = 'Something went wrong',
  description = 'Please try again later.',
}: QueryErrorProps) {
  const navigate = useNavigate()

  function handleRetry() {
    window.location.reload()
  }

  function handleBack() {
    navigate(-1)
  }

  return (
    <main className="flex h-full min-h-0 items-center justify-center">
      <div className="rounded-xl border px-6 py-8 text-center">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        <div className="mt-4 flex flex-wrap justify-between gap-2 *:flex-1">
          <Button variant="secondary" onClick={handleBack}>
            <ArrowLeftIcon />
            Back
          </Button>
          <Button asChild variant="secondary">
            <Link to={paths.root.getHref()}>
              <HouseIcon /> Home
            </Link>
          </Button>
          <Button onClick={handleRetry} className="basis-full!">
            <CircleNotchIcon />
            Try again
          </Button>
        </div>
      </div>
    </main>
  )
}

export default QueryError
