import { z, ZodError } from 'zod'

const EnvSchema = z.object({
  API_URL: z.string(),
  APP_URL: z.string().optional().default('http://localhost:5173'),
  APP_MOCK_API_PORT: z.string().optional().default('8080'),
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
        .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
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
