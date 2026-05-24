import { email, safeParse } from 'zod'

import { cn } from '@/lib'

type EmailProps = {
  email: unknown
  className?: string
}

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
