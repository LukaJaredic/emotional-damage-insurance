import { email, safeParse } from 'zod'

import { cn } from '@/lib'

type EmailProps = {
  email: unknown
  className?: string
}

/**
 * Renders a mailto link when the provided value is a valid email address - "Invalid email" `span` otherwise.
 *
 * @param email Value to validate and render as an email link.
 * @param className Optional class name applied to the rendered element.
 */
function Email({ email, className }: EmailProps) {
  if (!isValidEmail(email)) {
    return <span className={className}>Invalid email</span>
  }

  return (
    <a
      onClick={stopPropagation}
      className={cn(className, 'underline underline-offset-4')}
      href={`mailto:${email}`}
    >
      {email}
    </a>
  )
}

function stopPropagation(e: React.MouseEvent) {
  e.stopPropagation()
}

function isValidEmail(value: unknown): value is string {
  return safeParse(email(), value).success
}

export default Email
