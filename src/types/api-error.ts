export type ApiErrorCode =
  | 'INTERNAL_ERROR'
  // Authentication related errors
  | 'AUTHENTICATION_REQUIRED'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  // Policy holder related errors
  | 'POLICY_HOLDER_ALREADY_EXISTS'
  | 'POLICY_HOLDER_NOT_FOUND'
  // Policy related errors
  | 'POLICY_ALREADY_EXISTS'
  | 'POLICY_ALREADY_TERMINATED'
  | 'POLICY_HAS_USERS'
  | 'POLICY_INVALID_DATE_RANGE'
  | 'POLICY_NOT_FOUND'
  | 'POLICY_NOT_TERMINATED'
  | 'POLICY_USER_ALREADY_CONNECTED'
  | 'POLICY_USER_HAS_OVERLAPPING_POLICY'
  | 'POLICY_USER_NOT_CONNECTED'
  // User related errors
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
