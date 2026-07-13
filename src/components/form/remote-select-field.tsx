import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/shadcn/field'

import RemoteSelect from './remote-select'
import type { RemoteSelectProps, RemoteSelectQuery } from './remote-select'

type RemoteSelectFieldProps<
  TFieldValues extends FieldValues,
  TItem extends Record<string, unknown>,
  TQuery extends RemoteSelectQuery = RemoteSelectQuery,
> = Omit<
  RemoteSelectProps<TItem, TQuery>,
  'inputId' | 'name' | 'value' | 'onChange'
> & {
  id: string
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
}

/**
 * Renders a react-hook-form select field backed by a remote-data hook.
 *
 * @param control - The react-hook-form control object.
 * @param name - The name of the field in the form values.
 * @param label - The label to display for the field.
 * @param description - Optional description text for the field.
 * @param id - The HTML id attribute for the select input.
 * @param props - Additional props to pass to the RemoteSelect component.
 */
function RemoteSelectField<
  TFieldValues extends FieldValues,
  TItem extends Record<string, unknown>,
  TQuery extends RemoteSelectQuery = RemoteSelectQuery,
>({
  control,
  name,
  label,
  description,
  id,
  ...props
}: RemoteSelectFieldProps<TFieldValues, TItem, TQuery>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error

        return (
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <RemoteSelect
              {...props}
              inputId={id}
              name={field.name}
              value={(field.value ?? '') as string}
              onChange={field.onChange as (value: string) => void}
              aria-invalid={!!error}
            />
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

export default RemoteSelectField
export type { RemoteSelectFieldProps }
