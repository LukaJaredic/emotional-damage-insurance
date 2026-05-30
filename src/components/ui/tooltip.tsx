import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip'

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive> & {
  trigger: React.ReactNode
  children: React.ReactNode
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
