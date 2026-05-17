import type { loginSchema } from '../utils/login'

export type LoginFormData = z.infer<typeof loginSchema>
export type LoginAction = LoginFormData
