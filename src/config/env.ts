import { z, ZodError } from 'zod'

const EnvSchema = z
  .object({
    API_URL: z.string(),
    APP_URL: z.string(),
    MOCK_API_PORT: z.string(),
    SENTRY_ENABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    SENTRY_DSN: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.SENTRY_ENABLED && !env.SENTRY_DSN) {
      ctx.addIssue({
        code: 'custom',
        path: ['SENTRY_DSN'],
        message: 'SENTRY_DSN is required when SENTRY_ENABLED is true',
      })
    }
  })

function mapEnvToClient(env: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key.startsWith('VITE_APP_') ? key.replace('VITE_APP_', '') : key,
      value,
    ]),
  )
}

class EnvError extends Error {
  constructor(validationError: ZodError) {
    super(
      `Invalid env provided.\n${validationError.issues
        .map((issue) => `VITE_APP_${issue.path.join('.')} - ${issue.message}`)
        .join('\n')}`,
    )
    this.name = 'EnvError'
  }
}

const createEnv = () => {
  const envVars = mapEnvToClient(import.meta.env)
  const parsedEnv = EnvSchema.safeParse(envVars)

  if (!parsedEnv.success) {
    throw new EnvError(parsedEnv.error)
  }

  return parsedEnv.data
}

export const env = createEnv()
