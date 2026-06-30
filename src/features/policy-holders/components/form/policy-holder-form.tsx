import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { InputField, SelectField } from '@/components/form'
import { Spinner } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import { FieldGroup } from '@/components/ui/shadcn/field'
import type { PolicyHolder } from '@/types'
import { rowSm } from '@/utils/style'
import { useCreatePolicyHolder } from '@features/policy-holders/api/create-policy-holder'
import { useUpdatePolicyHolder } from '@features/policy-holders/api/update-policy-holder'
import type {
  PolicyHolderFormStatus,
  PolicyHolderFormValues,
} from '@features/policy-holders/types/policy-holder-form.types'
import {
  buildCreatePolicyHolderPayload,
  buildPolicyHolderFormValues,
  buildUpdatePolicyHolderPayload,
  createSchema,
  updateSchema,
} from '@features/policy-holders/utils/policy-holder-form'
import { typeOptions } from '@features/policy-holders/utils/policy-holder-options'

export type PolicyHolderFormProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  policyHolder?: PolicyHolder | undefined
  showSubmit?: boolean | undefined
  onStatusChange?: ((status: PolicyHolderFormStatus) => void) | undefined
}

function PolicyHolderForm({
  policyHolder,
  showSubmit = true,
  onStatusChange,
  ...props
}: PolicyHolderFormProps) {
  const isEdit = !!policyHolder

  const createMutation = useCreatePolicyHolder()
  const updateMutation = useUpdatePolicyHolder()

  const form = useForm<PolicyHolderFormValues>({
    resolver: zodResolver(isEdit ? updateSchema : createSchema),
    defaultValues: buildPolicyHolderFormValues(policyHolder),
    shouldUnregister: true,
  })

  const selectedType = useWatch({ control: form.control, name: 'type' })
  const isPending = createMutation.isPending || updateMutation.isPending

  async function handleSubmit(data: PolicyHolderFormValues) {
    // Submit button can be outside of the form.
    if (isPending) {
      return
    }

    onStatusChange?.('pending')

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(
          buildUpdatePolicyHolderPayload(policyHolder.id, data),
        )
      } else {
        await createMutation.mutateAsync(buildCreatePolicyHolderPayload(data))
      }

      onStatusChange?.('success')
    } catch {
      onStatusChange?.('idle')
    }
  }

  return (
    <form {...props} onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <SelectField
          control={form.control}
          id="policy-holder-type"
          name="type"
          label="Type"
          placeholder="Choose type"
          options={typeOptions}
          isClearable={false}
        />
        {selectedType === 'business' ? (
          <InputField
            control={form.control}
            id="business-name"
            name="businessName"
            label="Business name"
            type="text"
            autoComplete="organization"
            placeholder="Acme Insurance"
          />
        ) : (
          <div className={rowSm}>
            <InputField
              control={form.control}
              id="first-name"
              name="firstName"
              label="First name"
              type="text"
              autoComplete="given-name"
              placeholder="John"
            />
            <InputField
              control={form.control}
              id="last-name"
              name="lastName"
              label="Last name"
              type="text"
              autoComplete="family-name"
              placeholder="Doe"
            />
          </div>
        )}
        <InputField
          control={form.control}
          id="government-id"
          name="governmentId"
          label={selectedType === 'business' ? 'Tax ID' : 'Government ID'}
          type="text"
          inputMode="numeric"
          placeholder={
            selectedType === 'business' ? '12345678' : '1234567890123'
          }
        />
        <div className={rowSm}>
          <InputField
            control={form.control}
            id="email"
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="john.doe@example.com"
          />
          <InputField
            control={form.control}
            id="phone"
            name="phone"
            label="Phone"
            type="text"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+38269123456"
            description="Use E.164 format, for example +38269123456."
          />
        </div>
      </FieldGroup>
      {showSubmit ? (
        <Button type="submit" className="mt-6" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {isEdit ? 'Save policy holder' : 'Create policy holder'}
        </Button>
      ) : null}
    </form>
  )
}

export default PolicyHolderForm
