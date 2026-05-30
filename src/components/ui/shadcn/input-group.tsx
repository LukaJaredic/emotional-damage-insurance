import * as React from 'react'

import { Button } from '@/components/ui/shadcn/button'
import { cn } from '@/lib/utils'

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        'group/input-group border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40 flex min-w-0 items-center rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-3 has-aria-invalid:ring-3',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input-group-control"
      className={cn(
        'placeholder:text-muted-foreground h-9 min-w-0 flex-1 bg-transparent px-2.5 py-1 text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end'
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        'flex items-center px-1',
        align === 'inline-end' ? 'order-last' : 'order-first',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupButton({
  className,
  variant = 'ghost',
  size = 'icon-xs',
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="input-group-button"
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput }
