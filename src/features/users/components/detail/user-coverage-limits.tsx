import { useState } from 'react'

import { Spinner, Tabs, Time } from '@/components/ui'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/shadcn/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/shadcn/empty'
import { Progress } from '@/components/ui/shadcn/progress'
import type { PolicyLimits, PolicyWithUserLimits, User } from '@/types'
import { limitLabels, toEur } from '@/utils'
import { useUserLimits } from '@features/users/api/get-user-limits'

type UserCoverageLimitsProps = {
  userId: User['id']
}

function UserCoverageLimits({ userId }: UserCoverageLimitsProps) {
  const query = useUserLimits({ userId })
  const [now] = useState(Date.now)

  if (query.isPending) {
    return (
      <div
        role="status"
        className="flex min-h-48 items-center justify-center gap-3 rounded-xl border"
      >
        <Spinner />
        <span>Loading coverage limits...</span>
      </div>
    )
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load coverage limits</AlertTitle>
        <AlertDescription>
          Something went wrong while loading coverage limits.
        </AlertDescription>
      </Alert>
    )
  }

  if (query.data.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No coverage limits found</EmptyTitle>
          <EmptyDescription>
            This user is not currently connected to any policies.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const policies = query.data.toSorted(
    (a, b) => b.startDate.getTime() - a.startDate.getTime(),
  )
  const defaultPolicy =
    policies.find((policy) => isActive(policy, now)) ?? policies[0]!

  return (
    <Tabs
      items={policies.map((policy) => ({
        value: policy.id,
        label: policy.name,
        content: <PolicyLimits policy={policy} />,
      }))}
      defaultValue={defaultPolicy.id}
      ariaLabel="User policies"
      listVariant="line"
      tabsContentClassName="pt-4"
    />
  )
}

function isActive(policy: PolicyWithUserLimits, now: number) {
  return (
    !policy.terminated &&
    policy.startDate.getTime() <= now &&
    policy.endDate.getTime() >= now
  )
}

function PolicyLimits({ policy }: { policy: PolicyWithUserLimits }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{policy.name}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Time date={policy.startDate} format="date" />
          <span aria-hidden="true">-</span>
          <Time date={policy.endDate} format="date" />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {(Object.keys(limitLabels) as (keyof PolicyLimits)[]).map((limit) => (
          <LimitProgress
            key={limit}
            label={limitLabels[limit]}
            remaining={policy.userLimits[limit]}
            total={policy.limits[limit]}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function LimitProgress({
  label,
  remaining,
  total,
}: {
  label: string
  remaining: number
  total: number
}) {
  const percentage =
    total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0

  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground text-sm">
          {toEur(remaining)} / {toEur(total)}
        </span>
      </div>
      <Progress
        value={percentage}
        aria-label={`${label} remaining`}
        aria-valuetext={`${toEur(remaining)} remaining of ${toEur(total)}`}
      />
    </div>
  )
}

export default UserCoverageLimits
