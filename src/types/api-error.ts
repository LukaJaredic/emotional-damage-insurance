export type ApiErrorCode =
  | 'AUTHENTICATION_REQUIRED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'POLICY_HOLDER_ALREADY_EXISTS'
  | 'POLICY_HOLDER_NOT_FOUND'
  | 'USER_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode
    message: string
    status: number
    fieldErrors?: Record<string, string[]>
  }
}

export function isStandardAPIError(
  error: unknown,
): error is ApiErrorResponse['error'] {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'status' in error
  ) {
    return true
  }

  return false
}

export function isValidationApiError(
  error: unknown,
): error is Required<ApiErrorResponse['error']> {
  return isStandardAPIError(error) && !!error.fieldErrors
}
