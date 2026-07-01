import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'

import { paths } from '@/config/paths'
import { cn } from '@/lib'

import { Button } from '../ui/shadcn/button'

export type ErrorActionsProps = {
  type: 'back-home' | 'back-login' | 'back-home-retry' | 'back-login-retry'
}

export function ErrorActions({ type }: ErrorActionsProps) {
  const navigate = useNavigate()

  const hasHome = type.includes('home')
  const hasRetry = type.includes('retry')

  return (
    <div className="group">
      <div className="mb-4 flex flex-col items-center gap-4 sm:mb-0 sm:flex-row sm:gap-0">
        <Button
          type="button"
          variant="link"
          onClick={() => navigate(-1)}
          className="group animate-fade-in-left stagger-self-9 text-4xl sm:group-hover:-translate-x-2"
        >
          <ArrowLeftIcon className="size-10 duration-200 ease-out group-hover:scale-x-120" />
          Back
        </Button>
        <Or />
        <Button
          type="button"
          variant="link"
          asChild
          className="animate-fade-in-right stagger-self-11 text-4xl sm:group-hover:translate-x-2"
        >
          <Link
            to={hasHome ? paths.root.getHref() : paths.auth.login.getHref()}
          >
            {hasHome ? 'Home' : 'Login'}{' '}
            <ArrowRightIcon className="size-10 duration-200 ease-out group-hover:scale-x-120" />
          </Link>
        </Button>
      </div>

      {hasRetry ? (
        <>
          <Or className="sm:hidden" />
          <Button
            type="button"
            variant="link"
            onClick={() => window.location.reload()}
            className="animate-fade-in-up stagger-self-12 mt-4 text-4xl sm:-mt-1 sm:text-lg"
          >
            <ArrowCounterClockwiseIcon className="size-10 duration-200 ease-in group-hover:-rotate-90 sm:size-6" />{' '}
            Retry
          </Button>
        </>
      ) : null}
    </div>
  )
}

function Or({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        `animate-fade-in-right stagger-self-6 -mx-4 rotate-90 text-2xl font-bold transition-all duration-200 ease-out group-hover:rotate-0`,
        className,
      )}
    >
      OR
    </div>
  )
}

export default ErrorActions
