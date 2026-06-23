import { cn } from '@/lib'

import { ErrorActions, type ErrorActionsProps } from './error-actions'

export type ErrorProps = {
  variant: 'page' | 'container'
  title: string
  description: string
  status: string | number
  actions: ErrorActionsProps['type']
  onActionClick: ErrorActionsProps['onActionClick']
}

const headingClassName = 'text'

function Error({
  status,
  variant,
  title,
  description,
  actions,
  onActionClick,
}: ErrorProps) {
  return (
    <main
      className={cn(
        'animate-page-in flex flex-col items-center justify-center gap-4 px-6 text-center',
        variant === 'page' ? 'min-h-dvh' : 'h-full min-h-0',
      )}
    >
      {variant === 'page' ? (
        <h1 className={'text-2xl'}>{title}</h1>
      ) : (
        <h2 className={headingClassName}>{title}</h2>
      )}

      <div className="font-heading text-foreground animate-fade-in-up stagger-self-2 text-8xl font-bold">
        {status}
      </div>

      <p className="text-muted-foreground animate-fade-in-up stagger-self-4">
        {description}
      </p>
      <ErrorActions type={actions} onActionClick={onActionClick} />
    </main>
  )
}

export default Error
