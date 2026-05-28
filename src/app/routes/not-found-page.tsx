import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/shadcn/button'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-foreground text-8xl font-bold">404</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find what you are looking for
      </p>
      <Button
        type="button"
        variant="link"
        onClick={() => navigate(-1)}
        className="text-xl"
      >
        <ArrowLeftIcon className="size-6" /> Back
      </Button>
    </main>
  )
}

export default NotFoundPage
