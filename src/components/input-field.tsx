import { EyeClosedIcon, EyeIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { FieldError as FieldErrorType } from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import Input from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

type InputFieldType = 'email' | 'text' | 'number' | 'password'

type InputFieldProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  label: string
  type: InputFieldType
  description?: string
  error: FieldErrorType | undefined
}

function InputField({
  label,
  description,
  error,
  id,
  type,
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {type === 'password' ? (
        <InputGroup>
          <InputGroupInput
            id={id}
            type={inputType}
            aria-invalid={!!error}
            {...props}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-sm"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <Input id={id} type={inputType} aria-invalid={!!error} {...props} />
      )}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {error ? <FieldError errors={[error]} /> : null}
    </Field>
  )
}

export default InputField
