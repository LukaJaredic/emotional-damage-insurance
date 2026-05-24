import { Link } from 'react-router-dom'
import { safeParse } from 'zod'

import type { TableColumn } from '@/components/data/table'

import { email } from './zod-schemas'

type PrimaryLinkColumnOptions<T> = {
  title: string
  dataIndex: keyof T
  getHref: (row: T) => string
  getLabel: (row: T) => string
}

type TableColumnBuilder<T> = Readonly<{
  text: (title: string, dataIndex: keyof T) => TableColumn<T>
  email: (title: string, dataIndex: keyof T) => TableColumn<T>
  primaryLink: (options: PrimaryLinkColumnOptions<T>) => TableColumn<T>
  array: (title: string, dataIndex: keyof T) => TableColumn<T>
}>

export function tableColumnBuilder<T>(): TableColumnBuilder<T> {
  return {
    text: (title: string, dataIndex: keyof T) => ({ title, dataIndex }),
    email: (title: string, dataIndex: keyof T) => ({
      title,
      dataIndex,
      render: (row) => renderEmailCell(row[dataIndex]),
    }),
    array: (title: string, dataIndex: keyof T) => ({
      title,
      dataIndex,
      render: (row) => renderArrayCell(row[dataIndex]),
    }),
    primaryLink: ({ title, dataIndex, getHref, getLabel }) => ({
      title,
      dataIndex,
      render: (row) => renderPrimaryLinkCell(getHref(row), getLabel(row)),
    }),
  }
}

function renderArrayCell(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return 'Invalid array value'
}

function renderPrimaryLinkCell(href: string, label: string) {
  return (
    <Link
      className="focus-visible:ring-ring underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-2"
      to={href}
    >
      {label}
    </Link>
  )
}

function renderEmailCell(value: unknown) {
  if (isValidEmail(value)) {
    return (
      <a
        onClick={stopPropagation}
        className="relative z-10 underline"
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
