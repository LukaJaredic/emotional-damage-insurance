import { captureException } from '@sentry/react'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config'
import type { ApiErrorResponse } from '@/types'

const FALLBACK_ERROR_MESSAGE = 'Something went wrong. Please try again.'

const getUserSafeErrorMessage = (
  error: AxiosError<ApiErrorResponse>,
): string => {
  const message = error.response?.data?.error?.message

  if (typeof message === 'string' && message.trim()) {
    return message
  }

  return FALLBACK_ERROR_MESSAGE
}

const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const axiosError = error as AxiosError<ApiErrorResponse>

    if (error.config?.method?.toLowerCase() !== 'get') {
      toast.error(getUserSafeErrorMessage(axiosError))
    }

    captureException(error)

    return Promise.reject(error)
  },
)

export { api }
