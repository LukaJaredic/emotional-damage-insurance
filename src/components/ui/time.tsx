import { toAppDate, toAppDateTime } from '@/utils'

type TimeProps = {
  date: Date | string | number
  format: 'date' | 'datetime'
} & React.HTMLAttributes<HTMLTimeElement>

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
