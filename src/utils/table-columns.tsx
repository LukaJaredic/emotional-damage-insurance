import { safeParse } from 'zod'

import type { TableColumn } from '@/components/data/table'

import { email } from './zod-schemas'

export function tableColumnBuilder<T>(): Record<
  'text' | 'email',
  (title: string, dataIndex: keyof T) => TableColumn<T>
> {
  return {
    text: (title: string, dataIndex: keyof T) => ({ title, dataIndex }),
    email: (title: string, dataIndex: keyof T) => ({
      title,
      dataIndex,
      render: (row) => renderEmailCell(row[dataIndex]),
    }),
  } as const
}

function renderEmailCell(value: unknown) {
  if (isValidEmail(value)) {
    return (
      <a
        onClick={stopPropagation}
        className="underline"
        href={`mailto:${value}`}
      >
        {value}
      </a>
    )
  }

  return 'Invalid email value'
}

function stopPropagation(e: React.MouseEvent) {
  e.stopPropagation()
}

function isValidEmail(value: unknown): value is string {
  return safeParse(email(), value).success
}
