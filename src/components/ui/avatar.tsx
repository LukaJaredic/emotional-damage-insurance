import {
  Avatar as UIAvatar,
  AvatarFallback,
} from '@/components/ui/shadcn/avatar'
import type { User } from '@/types'

type AvatarProps = {
  user: User
}

/**
 * Renders a user avatar using the user's initials.
 *
 * @param user User whose initials should be displayed.
 */
function Avatar({ user }: AvatarProps) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <UIAvatar size="lg">
      <AvatarFallback>{initials}</AvatarFallback>
    </UIAvatar>
  )
}

export default Avatar
