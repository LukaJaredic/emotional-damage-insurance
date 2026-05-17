import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive> & {
  trigger: React.ReactNode
  children: React.ReactNode
}

function Tooltip({ trigger, children, ...props }: TooltipProps) {
  return (
    <TooltipPrimitive {...props}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </TooltipPrimitive>
  )
}

export default Tooltip
