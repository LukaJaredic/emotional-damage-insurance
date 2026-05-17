import { SpinnerBallIcon } from '@phosphor-icons/react'

import { cn } from '@/lib/utils'

type SpinnerProps = {
  className?: string
} & Omit<React.ComponentProps<typeof SpinnerBallIcon>, 'className'>

function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <span title="Loading...">
      <SpinnerBallIcon className={cn('animate-spin', className)} {...props} />
    </span>
  )
}

export default Spinner
