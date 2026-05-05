import { QuestionMarkIcon } from '@phosphor-icons/react'

import Tooltip from '@/components/tooltip'
import Button from '@/components/ui/button'

type CommonTooltipProps = Omit<
  React.ComponentProps<typeof Tooltip>,
  'trigger'
> & {
  title?: string
  children?: React.ReactNode
}

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
