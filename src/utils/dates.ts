import { format } from 'date-fns'

/**
 * Formats a date-like value using the application's default date format.
 * @param date The date to format, which can be a Date object, a string, or a timestamp.
 * @returns The formatted date string (eg. 31.01.2024).
 */
export function toAppDate(date: Date | string | number): string {
  try {
    return format(new Date(date), 'dd.MM.yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Formats a date-like value using the application's default date and time format.
 * @param date The date to format, which can be a Date object, a string, or a timestamp.
 * @returns The formatted date and time string (eg. 31.01.2024 - 12:30).
 */
export function toAppDateTime(date: Date | string | number): string {
  try {
    return format(new Date(date), "dd.MM.yyyy '-' HH:mm")
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}
