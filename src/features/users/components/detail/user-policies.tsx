import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'

import { PolicyStatus } from '@/components/policies'
import { Spinner, Tabs, Time } from '@/components/ui'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/shadcn/alert'
import { Button } from '@/components/ui/shadcn/button'
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
import { usePermissions } from '@/hooks'
import type { PolicyLimits, PolicyWithUserLimits, User } from '@/types'
import { limitLabels, toEur } from '@/utils'
import { useUserLimits } from '@features/users/api/get-user-limits'

import UserAddPolicyDialog from './user-add-policy-dialog'
import UserRemovePolicyDialog from './user-remove-policy-dialog'

type UserPoliciesProps = {
  user: User
}

function UserPolicies({ user }: UserPoliciesProps) {
  const query = useUserLimits({ userId: user.id })
  const [now] = useState(Date.now)
  const { can } = usePermissions()
  const canManageUserPolicies =
    can('user:update', user, '*') && can('policy:update', '*', '*')

  let content

  if (query.isPending) {
    content = (
      <div
        role="status"
        className="flex min-h-48 items-center justify-center gap-3 rounded-xl border"
      >
        <Spinner />
        <span>Loading coverage limits...</span>
      </div>
    )
  } else if (query.isError) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Unable to load coverage limits</AlertTitle>
        <AlertDescription>
          Something went wrong while loading coverage limits.
        </AlertDescription>
      </Alert>
    )
  } else if (query.data.length === 0) {
    content = (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No coverage limits found</EmptyTitle>
          <EmptyDescription>
            This user is not currently connected to any policies.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  } else {
    const policies = query.data.toSorted(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    )
    const defaultPolicy =
      policies.find((policy) => isActive(policy, now)) ?? policies[0]!

    content = (
      <Tabs
        items={policies.map((policy) => ({
          value: policy.id,
          label: policy.name,
          content: <PolicyLimits policy={policy} user={user} />,
        }))}
        defaultValue={defaultPolicy.id}
        ariaLabel="User policies"
        listVariant="line"
        tabsContentClassName="pt-4"
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {canManageUserPolicies ? (
        <UserAddPolicyDialog user={user}>
          <Button className="sm:ml-auto sm:w-fit">
            <PlusIcon /> Add policy
          </Button>
        </UserAddPolicyDialog>
      ) : null}
      {content}
    </div>
  )
}

function isActive(policy: PolicyWithUserLimits, now: number) {
  return (
    !policy.terminated &&
    policy.startDate.getTime() <= now &&
    policy.endDate.getTime() >= now
  )
}

function PolicyLimits({
  policy,
  user,
}: {
  policy: PolicyWithUserLimits
  user: User
}) {
  const { can } = usePermissions()
  const canRemove =
    can('user:update', user, '*') && can('policy:update', policy)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <PolicyStatus policy={policy} />
            <span>{policy.name}</span>
          </CardTitle>
          {canRemove ? (
            <UserRemovePolicyDialog user={user} policy={policy}>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                aria-label="Remove policy from user"
                title="Remove policy from user"
              >
                <TrashIcon />
              </Button>
            </UserRemovePolicyDialog>
          ) : null}
        </div>

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

export default UserPolicies
