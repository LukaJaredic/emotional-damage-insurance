import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useConnectPolicyUser, usePolicies } from '@/api/policies'
import { RemoteSelectField } from '@/components/form'
import { Spinner } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { FieldGroup } from '@/components/ui/shadcn/field'
import type { Policy, User } from '@/types'
import { setApiFieldErrors, toAppDate } from '@/utils'

const policyParams = { terminated: 'false', expired: 'false' }

const addPolicySchema = z.object({
  policyId: z.string().min(1, 'Choose a policy to add.'),
})

type AddPolicyFormValues = z.infer<typeof addPolicySchema>

export type UserAddPolicyFormStatus = 'idle' | 'pending' | 'success'

export type UserAddPolicyFormProps = Omit<
  ComponentProps<'form'>,
  'onSubmit' | 'noValidate'
> & {
  user: User
  showSubmit?: boolean | undefined
  onStatusChange?: ((status: UserAddPolicyFormStatus) => void) | undefined
}

function renderPolicyOption(policy: Policy) {
  return {
    value: policy.id,
    label: `${policy.name} (${toAppDate(policy.startDate)} - ${toAppDate(policy.endDate)})`,
  }
}

function UserAddPolicyForm({
  user,
  showSubmit = true,
  onStatusChange,
  ...props
}: UserAddPolicyFormProps) {
  const mutation = useConnectPolicyUser()

  const form = useForm<AddPolicyFormValues>({
    resolver: zodResolver(addPolicySchema),
    defaultValues: { policyId: '' },
  })

  const isPending = mutation.isPending

  async function handleSubmit(data: AddPolicyFormValues) {
    if (isPending) {
      return
    }

    onStatusChange?.('pending')

    try {
      await mutation.mutateAsync({ policyId: data.policyId, userId: user.id })
      onStatusChange?.('success')
      form.reset()
    } catch (error: unknown) {
      onStatusChange?.('idle')
      setApiFieldErrors(form, error)
    }
  }

  return (
    <form {...props} onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <RemoteSelectField
          control={form.control}
          id="policy-id"
          name="policyId"
          label="Policy"
          placeholder="Search policies"
          useRemoteData={usePolicies}
          renderOption={renderPolicyOption}
          params={policyParams}
          disabled={isPending}
        />
      </FieldGroup>
      {showSubmit ? (
        <Button type="submit" className="mt-6" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          Add policy
        </Button>
      ) : null}
    </form>
  )
}

export default UserAddPolicyForm
