import type { ComponentProps, ReactNode } from 'react'

import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip'

type TooltipProps = ComponentProps<typeof TooltipPrimitive> & {
  trigger: ReactNode
  children: ReactNode
}

/**
 * Renders a tooltip with an explicit trigger element.
 *
 * @param trigger Element used to open the tooltip.
 * @param children Content rendered inside the tooltip panel.
 * @param props Additional tooltip props passed to the underlying `<TooltipPrimitive>`.
 */
function Tooltip({ trigger, children, ...props }: TooltipProps) {
  return (
    <TooltipPrimitive {...props}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </TooltipPrimitive>
  )
}

export default Tooltip
