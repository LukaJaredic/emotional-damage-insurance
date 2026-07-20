import { cn } from '@/lib/utils'
import type { Policy } from '@/types'
import { policyStatusLabel } from '@/utils/policy-labels'
import { policyStatus } from '@/utils/policy-status'

type PolicyStatusProps = {
  policy: Policy
}

function PolicyStatus({ policy }: PolicyStatusProps) {
  const status = policyStatus(policy)

  return (
    <span
      className={cn(
        status === 'active' && 'bg-green-300',
        status === 'terminated' && 'bg-red-300',
        status === 'expired' && 'bg-gray-300',
        status === 'future' && 'bg-blue-300',
        'text-foreground rounded-xs px-1',
      )}
    >
      {policyStatusLabel(policy)}
    </span>
  )
}

export default PolicyStatus
