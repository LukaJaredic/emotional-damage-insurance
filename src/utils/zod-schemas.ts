import { z } from 'zod'

/**
 * Builds a trimmed required string schema with optional length limits.
 *
 * @param minLength Minimum number of characters allowed after trimming.
 * @param maxLength Maximum number of characters allowed.
 * @returns A Zod string schema with required and length validation (with messages).
 */
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

/**
 * Builds an email schema with the application's default validation message.
 *
 * @returns A Zod email schema.
 */
export function email() {
  return z.email({ message: 'Invalid email address' })
}

/**
 * Builds a select schema for one of predefined string options.
 *
 * @param options Allowed option values.
 * @param required Whether an option must be selected.
 * @returns A Zod enum schema for the provided select options (with messages).
 */
export function singleSelect<T extends string>(options: T[], required = false) {
  const schema = z.enum(options)

  if (required) {
    return schema.refine((value) => value !== '', 'Select an option')
  }

  return schema
}

/**
 * Builds a select schema for one or more predefined string options.
 *
 * @param options Allowed option values.
 * @param required Whether at least one option must be selected.
 * @returns A Zod array schema for the provided select options (with messages).
 */
export function multipleSelect<T extends string>(
  options: T[],
  required = false,
) {
  const schema = z.array(z.enum(options))

  if (required) {
    return schema.min(1, 'Select at least one option')
  }
  return schema
}
