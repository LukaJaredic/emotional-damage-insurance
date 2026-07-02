import { isAxiosError } from 'axios'
import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

import { isValidationApiError, type ApiErrorResponse } from '@/types'

export function setApiFieldErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  apiError: unknown,
) {
  if (!isAxiosError<ApiErrorResponse>(apiError)) {
    return false
  }

  const error = apiError.response?.data?.error

  if (!isValidationApiError(error)) {
    console.log('error is not a validation error', error)
    console.log(JSON.stringify(error, null, 2))
    return false
  }

  let shouldFocus = true

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    form.setError(
      field as FieldPath<TFieldValues>,
      {
        type: 'server',
        message: messages[0] ?? error.message,
      },
      { shouldFocus },
    )

    // Focus only the first field with an error
    shouldFocus = false
  }

  return true
}
