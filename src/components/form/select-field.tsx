import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/shadcn/field'

import Select from './select'
import type { SelectProps } from './select'

type BaseSelectFieldProps<TFieldValues extends FieldValues> = {
  id: string
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
}

type SingleSelectFieldProps<TFieldValues extends FieldValues> = Omit<
  Extract<SelectProps, { isMultiple?: false }>,
  'name' | 'value' | 'onChange' | 'inputId'
> &
  BaseSelectFieldProps<TFieldValues>

type MultiSelectFieldProps<TFieldValues extends FieldValues> = Omit<
  Extract<SelectProps, { isMultiple: true }>,
  'name' | 'value' | 'onChange' | 'inputId'
> &
  BaseSelectFieldProps<TFieldValues>

type SelectFieldProps<TFieldValues extends FieldValues> =
  | SingleSelectFieldProps<TFieldValues>
  | MultiSelectFieldProps<TFieldValues>

function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  id,
  ...props
}: SelectFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error
        const selectProps = props.isMultiple
          ? {
              ...props,
              isMultiple: true as const,
              inputId: id,
              name: field.name,
              value: (field.value ?? []) as string[],
              onChange: field.onChange as (value: string[]) => void,
              'aria-invalid': !!error,
            }
          : {
              ...props,
              inputId: id,
              name: field.name,
              value: (field.value ?? '') as string,
              onChange: field.onChange as (value: string) => void,
              'aria-invalid': !!error,
            }

        return (
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Select {...selectProps} />
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {error ? <FieldError errors={[error]} /> : null}
          </Field>
        )
      }}
    />
  )
}

export default SelectField
