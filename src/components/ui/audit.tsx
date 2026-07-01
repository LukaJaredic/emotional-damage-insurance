import { useUserDetail } from '@/api'
import type { User } from '@/types'
import { toAppDateTime } from '@/utils'

type AuditProps = {
  userId: User['id']
  timestamp: number
}

function Audit({ userId, timestamp }: AuditProps) {
  const formattedDate = toAppDateTime(timestamp)
  const { data: user } = useUserDetail({ userId })

  if (user) {
    return <>{`${user.firstName} ${user.lastName} (${formattedDate})`}</>
  }

  return <>{`Unknown (${formattedDate})`}</>
}

export default Audit
