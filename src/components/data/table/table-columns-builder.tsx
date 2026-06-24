import type { ReactNode } from 'react'
import { Link } from 'react-router'

import type { TableColumn } from '@/components/data/table'
import { Email } from '@/components/ui'
import Phone from '@/components/ui/phone'

type PrimaryLinkColumnOptions<T> = {
  title: string
  dataIndex: keyof T
  getHref: (row: T) => string
  getLabel: (row: T) => string
}

type TableColumnBuilder<T> = Readonly<{
  text: (title: string, dataIndex: keyof T) => TableColumn<T>
  email: (title: string, dataIndex: keyof T) => TableColumn<T>
  phone: (title: string, dataIndex: keyof T) => TableColumn<T>
  primaryLink: (options: PrimaryLinkColumnOptions<T>) => TableColumn<T>
  array: (title: string, dataIndex: keyof T) => TableColumn<T>
  custom: (options: {
    title: string
    dataIndex: keyof T
    render: (row: T) => ReactNode
  }) => TableColumn<T>
}>

/**
 * Creates a helper for building common table column definitions.
 *
 * @returns A builder with shortcuts for common column types.
 */
export function tableColumnBuilder<T>(): TableColumnBuilder<T> {
  return {
    text: (title: string, dataIndex: keyof T) => ({ title, dataIndex }),
    email: (title: string, dataIndex: keyof T) => ({
      title,
      dataIndex,
      render: (row) => <Email className="relative" email={row[dataIndex]} />,
    }),
    phone: (title: string, dataIndex: keyof T) => ({
      title,
      dataIndex,
      render: (row) => <Phone className="relative" phone={row[dataIndex]} />,
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
    custom: ({
      title,
      dataIndex,
      render,
    }: {
      title: string
      dataIndex: keyof T
      render: (row: T) => ReactNode
    }) => ({
      title,
      dataIndex,
      render: (row) => render(row),
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
