import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config'

const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const axiosError = error as AxiosError<{ message?: string }>

    if (error.config?.method?.toLowerCase() !== 'get') {
      const message =
        axiosError.response?.data?.message ??
        'Something went wrong. Please try again.'

      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export { api }
