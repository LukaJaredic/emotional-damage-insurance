import { QuestionMarkIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/shadcn/button'
import Tooltip from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type CommonTooltipProps = Omit<
  React.ComponentProps<typeof Tooltip>,
  'trigger'
> & {
  title?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Renders a standard help tooltip with a question-mark trigger.
 *
 * @param title Accessible label and heading shown inside the tooltip.
 * @param className Optional class name for tooltip trigger.
 * @param children Tooltip content rendered below the title.
 * @param props Additional tooltip props passed to the underlying `<Tooltip>`.
 */
function CommonTooltip({
  title = 'Help',
  children,
  className,
  ...props
}: CommonTooltipProps) {
  return (
    <Tooltip
      trigger={
        <Button
          aria-label={title}
          size="icon-xs"
          className={cn('rounded-full', className)}
        >
          <QuestionMarkIcon />
        </Button>
      }
      {...props}
    >
      <div className="flex flex-col gap-1">
        <p className="border-b text-center font-medium">{title}</p>
        {children}
      </div>
    </Tooltip>
  )
}

export default CommonTooltip
