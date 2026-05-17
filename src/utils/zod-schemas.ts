import { z } from 'zod'

export function requiredString(minLength?: number, maxLength?: number) {
  let schema = z
    .string('Field is required')
    .trim()
    .min(
      minLength ?? 1,
      `Field must be at least ${minLength ?? 1} characters long`,
    )

  if (maxLength) {
    schema = schema.max(
      maxLength,
      `Field must be at most ${maxLength} characters long`,
    )
  }

  return schema
}
