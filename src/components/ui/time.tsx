import type { HTMLAttributes } from 'react'

import { toAppDate, toAppDateTime } from '@/utils'

type TimeProps = {
  date: Date | string | number
  format: 'date' | 'datetime'
} & HTMLAttributes<HTMLTimeElement>

/**
 * Renders a formatted date or date-time inside a semantic time element.
 *
 * @param date Date-like value used for both display and the `dateTime` attribute.
 * @param format Display format variant to use (options: 'date', 'datetime').
 * @param rest Additional HTML attributes passed to the time element.
 */
function Time({ date, format, ...rest }: TimeProps) {
  const formattedDate =
    format === 'date' ? toAppDate(date) : toAppDateTime(date)

  return (
    <time dateTime={new Date(date).toISOString()} {...rest}>
      {formattedDate}
    </time>
  )
}

export default Time
