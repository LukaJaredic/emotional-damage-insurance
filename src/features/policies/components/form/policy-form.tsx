import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'

import { usePolicyHolders } from '@/api/policy-holders'
import { InputField, RemoteSelectField } from '@/components/form'
import { Spinner } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/shadcn/field'
import type { PolicyHolder } from '@/types'
import { rowSm, setApiFieldErrors } from '@/utils'
import { useCreatePolicy } from '@features/policies/api/create-policy'
import type {
  PolicyFormStatus,
  PolicyFormValues,
} from '@features/policies/types/policy-form.types'
import {
  buildCreatePolicyPayload,
  buildPolicyFormValues,
  createSchema,
} from '@features/policies/utils/policy-form'
import { limitLabels } from '@features/policies/utils/policy-labels'

export type PolicyFormProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  showSubmit?: boolean | undefined
  onStatusChange?: ((status: PolicyFormStatus) => void) | undefined
}

function renderPolicyHolderOption(policyHolder: PolicyHolder) {
  const displayName =
    policyHolder.type === 'business'
      ? policyHolder.businessName
      : `${policyHolder.firstName} ${policyHolder.lastName}`

  return {
    label: `[${policyHolder.governmentId}] ${displayName}`,
    value: policyHolder.id,
  }
}

function PolicyForm({
  showSubmit = true,
  onStatusChange,
  ...props
}: PolicyFormProps) {
  const createMutation = useCreatePolicy()

  const form = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: buildPolicyFormValues(),
  })

  const isPending = createMutation.isPending

  async function handleSubmit(data: PolicyFormValues) {
    // Submit button can be outside of the form.
    if (isPending) {
      return
    }

    onStatusChange?.('pending')

    try {
      await createMutation.mutateAsync(buildCreatePolicyPayload(data))
      onStatusChange?.('success')
    } catch (e: unknown) {
      onStatusChange?.('idle')
      setApiFieldErrors(form, e)
    }
  }

  return (
    <form {...props} onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <RemoteSelectField
          control={form.control}
          id="policy-holder-id"
          name="policyHolderId"
          label="Policy holder"
          placeholder="Search policy holders"
          useRemoteData={usePolicyHolders}
          renderOption={renderPolicyHolderOption}
        />
        <InputField
          control={form.control}
          id="policy-name"
          name="name"
          label="Name"
          type="text"
          placeholder="CN - 1"
        />
        <InputField
          control={form.control}
          id="premium"
          name="premium"
          label="Premium"
          type="number"
          min={0}
          step="0.01"
          placeholder="250"
        />
        <div className={rowSm}>
          <InputField
            control={form.control}
            id="start-date"
            name="startDate"
            label="Start date"
            type="date"
          />
          <InputField
            control={form.control}
            id="end-date"
            name="endDate"
            label="End date"
            type="date"
          />
        </div>

        <FieldSet>
          <FieldLegend>Limits</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-4">
            {(
              Object.keys(limitLabels) as (keyof PolicyFormValues['limits'])[]
            ).map((limit) => (
              <InputField
                key={limit}
                control={form.control}
                id={`limit-${limit}`}
                name={`limits.${limit}`}
                label={limitLabels[limit]}
                type="number"
                min={0}
                step="0.01"
              />
            ))}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
      {showSubmit ? (
        <Button type="submit" className="mt-6" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          Create policy
        </Button>
      ) : null}
    </form>
  )
}

export default PolicyForm
