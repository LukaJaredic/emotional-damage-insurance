import { HttpResponse } from 'msw'

import type { ApiErrorCode, ApiErrorResponse } from '@/types'

const defaultMessages = {
  AUTHENTICATION_REQUIRED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INTERNAL_ERROR: 'Something went wrong on our side. Please try again.',
  INVALID_CREDENTIALS: 'The email or password is incorrect.',
  POLICY_HOLDER_ALREADY_EXISTS:
    'A policy holder with this information already exists.',
  POLICY_HOLDER_NOT_FOUND:
    'We could not find that policy holder. It may have been removed.',
  USER_ALREADY_EXISTS: 'A user with this information already exists.',
  USER_NOT_FOUND: 'We could not find that user. It may have been removed.',
} satisfies Record<ApiErrorCode, string>

type MockApiErrorParams = {
  code: ApiErrorCode
  status: number
  message?: string
  fieldErrors?: Record<string, string[]>
}

export function mockApiError({
  code,
  status,
  message = defaultMessages[code],
  fieldErrors,
}: MockApiErrorParams) {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      status,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
  }

  return HttpResponse.json(body, { status })
}

export function mockInternalError() {
  return mockApiError({ code: 'INTERNAL_ERROR', status: 500 })
}
