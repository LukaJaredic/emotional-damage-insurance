import {
  Avatar as UIAvatar,
  AvatarFallback,
} from '@/components/ui/shadcn/avatar'
import type { User } from '@/types'

type AvatarProps = {
  user: User
  size?: 'sm' | 'lg' | 'default'
}

/**
 * Renders a user avatar using the user's initials.
 *
 * @param user User whose initials should be displayed.
 * @param size Size of the avatar.
 */
function Avatar({ user, size = 'lg' }: AvatarProps) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`

  return (
    <UIAvatar size={size}>
      <AvatarFallback>{initials}</AvatarFallback>
    </UIAvatar>
  )
}

export default Avatar
