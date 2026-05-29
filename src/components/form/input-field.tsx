import { EyeClosedIcon, EyeIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/shadcn/field'
import { Input } from '@/components/ui/shadcn/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/shadcn/input-group'

type InputFieldType = 'email' | 'text' | 'number' | 'password'

type InputFieldProps<TFieldValues extends FieldValues> = Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur'
> & {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  type: InputFieldType
  description?: string
  className?: string
}

/**
 * Renders a react-hook-form input field with shared label, description, and error states.
 *
 * @param control Form control used by react-hook-form.
 * @param name Field name registered in the form.
 * @param label Field label.
 * @param description Optional helper text shown below the field.
 * @param id Input id used to associate the label.
 * @param type Input type to render (options: 'email', 'text', 'number', 'password').
 * @param className Optional class name for the field container.
 * @param props Additional input props passed to the underlying `<Input>` or `<InputGroupInput>`.
 */
function InputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  id,
  type,
  className,
  ...props
}: InputFieldProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error

        return (
          <Field data-invalid={!!error} className={className}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {type === 'password' ? (
              <InputGroup>
                <InputGroupInput
                  {...props}
                  {...field}
                  id={id}
                  type={inputType}
                  value={field.value ?? ''}
                  aria-invalid={!!error}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    size="icon-sm"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            ) : (
              <Input
                {...props}
                {...field}
                id={id}
                type={inputType}
                value={field.value ?? ''}
                aria-invalid={!!error}
              />
            )}
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

export default InputField
