import { QuestionMarkIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/shadcn/button'
import Tooltip from '@/components/ui/tooltip'

type CommonTooltipProps = Omit<
  React.ComponentProps<typeof Tooltip>,
  'trigger'
> & {
  title?: string
  children?: React.ReactNode
}

/**
 * Renders a standard help tooltip with a question-mark trigger.
 *
 * @param title Accessible label and heading shown inside the tooltip.
 * @param children Tooltip content rendered below the title.
 * @param props Additional tooltip props passed to the underlying `<Tooltip>`.
 */
function CommonTooltip({
  title = 'Help',
  children,
  ...props
}: CommonTooltipProps) {
  return (
    <Tooltip
      trigger={
        <Button aria-label={title} size="icon-xs" className="rounded-full">
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
