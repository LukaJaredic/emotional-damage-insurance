import { cn } from '@/lib/utils'
import type { Policy } from '@/types'

import { statusLabel } from '../utils/policy-labels'
import { status } from '../utils/policy-status'

type PolicyStatusProps = {
  policy: Policy
}

function PolicyStatus({ policy }: PolicyStatusProps) {
  const STATUS = status(policy)

  return (
    <span
      className={cn(
        STATUS === 'active' && 'bg-green-300',
        STATUS === 'terminated' && 'bg-red-300',
        STATUS === 'expired' && 'bg-gray-300',
        STATUS === 'future' && 'bg-blue-300',
        'text-foreground rounded-xs px-1',
      )}
    >
      {statusLabel(policy)}
    </span>
  )
}

export default PolicyStatus
