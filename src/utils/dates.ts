import { format } from 'date-fns'

export function toAppDate(date: Date | string | number): string {
  try {
    return format(new Date(date), 'dd.MM.yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function toAppDateTime(date: Date | string | number): string {
  try {
    return format(new Date(date), "dd.MM.yyyy '-' HH:mm")
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}
