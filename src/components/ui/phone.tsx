import { safeParse } from 'zod'

import { cn } from '@/lib'
import { phone, stopPropagation } from '@/utils'

type PhoneProps = {
  phone: unknown
  className?: string
}

/**
 * Renders a tel link when the provided value is a valid phone number - "Invalid phone" `span` otherwise.
 *
 * @param phone Value to validate and render as a phone link.
 * @param className Optional class name applied to the rendered element.
 */
function Phone({ phone, className }: PhoneProps) {
  if (!isValidPhone(phone)) {
    return <span className={className}>Invalid phone</span>
  }

  return (
    <a
      onClick={stopPropagation}
      className={cn(className, 'underline underline-offset-4')}
      href={`tel:${phone}`}
    >
      {phone}
    </a>
  )
}

function isValidPhone(value: unknown): value is string {
  return safeParse(phone(), value).success
}

export default Phone
