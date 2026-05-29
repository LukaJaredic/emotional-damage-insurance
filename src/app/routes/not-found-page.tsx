import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/shadcn/button'
import { paths } from '@/config'
import { useUser } from '@/hooks'

function NotFoundPage() {
  const navigate = useNavigate()
  const { user } = useUser()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-foreground text-8xl font-bold">404</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find what you are looking for
      </p>
      <div className="group flex flex-col items-center gap-4 sm:flex-row sm:gap-0">
        <Button
          type="button"
          variant="link"
          onClick={() => navigate(-1)}
          className="text-4xl"
        >
          <ArrowLeftIcon className="size-10" /> Back
        </Button>
        <div className="-mx-4 rotate-90 text-2xl font-bold transition-all duration-200 ease-out group-hover:mx-0 group-hover:rotate-0">
          OR
        </div>
        <Button type="button" variant="link" asChild className="text-4xl">
          <Link to={paths.root.getHref()}>
            {user ? 'Home' : 'Login'} <ArrowRightIcon className="size-10" />
          </Link>
        </Button>
      </div>
    </main>
  )
}

export default NotFoundPage
