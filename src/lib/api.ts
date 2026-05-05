import axios from 'axios'

import { env } from '@/config/env'

const api = axios.create({
  baseURL: env.API_URL,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling logic here, e.g., logging, notifications, etc.
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

export { api }
