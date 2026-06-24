import { SpinnerBallIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type SpinnerProps = {
  className?: string
} & Omit<ComponentProps<typeof SpinnerBallIcon>, 'className'>

/**
 * Renders the shared animated loading spinner icon.
 *
 * @param className Optional class name merged into the spinner icon.
 * @param props Additional icon props passed to the underlying `<SpinnerBallIcon>`.
 */
function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <span title="Loading...">
      <SpinnerBallIcon className={cn('animate-spin', className)} {...props} />
    </span>
  )
}

export default Spinner
