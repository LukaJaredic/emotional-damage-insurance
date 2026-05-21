import { useState } from 'react'
import { Link } from 'react-router-dom'

import List from './list'
import type { TableColumn } from './table'
import Table from './table'
import Button from './ui/button'

type DemoRow = {
  id: string
  claim: string
  policyholder: string
  status: string
}

const demoRows = Array.from({ length: 20 }, (_, index) => ({
  id: `item-${index + 1}`,
  claim: `Claim intake #${String(index + 1).padStart(2, '0')}`,
  policyholder: `Policyholder ${index + 1}`,
  status: index % 3 === 0 ? 'Review' : index % 2 === 0 ? 'Open' : 'Pending',
}))

const demoColumns: TableColumn<DemoRow>[] = [
  {
    dataIndex: 'claim',
    title: 'Claim',
  },
  {
    dataIndex: 'policyholder',
    title: 'Policyholder',
  },
  {
    dataIndex: 'status',
    title: 'Status',
    render: (row) => renderStatus(row.status),
  },
]

function renderStatus(status: string) {
  return (
    <Link
      to="#"
      className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
    >
      {status}
    </Link>
  )
}

function Scrap() {
  const [view, setView] = useState<'table' | 'list'>('table')
  const [isLoading, setIsLoading] = useState(false)
  const [virtualized, setVirtualized] = useState(false)

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold">
          Virtualized Data Views
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Demo of the generic list and table components rendering 20 claim rows
          with a custom status cell.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          aria-pressed={view === 'table'}
          onClick={() => setView('table')}
        >
          Table
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={view === 'list'}
          onClick={() => setView('list')}
        >
          List
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={isLoading}
          onClick={() => setIsLoading((current) => !current)}
        >
          {isLoading ? 'Disable loading' : 'Enable loading'}
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-pressed={virtualized}
          onClick={() => setVirtualized((current) => !current)}
        >
          {virtualized ? 'Disable virtualization' : 'Enable virtualization'}
        </Button>
      </div>

      <div className="h-128 overflow-hidden">
        {view === 'table' ? (
          <Table
            rows={demoRows}
            columns={demoColumns}
            caption="Claims overview table"
            isLoading={isLoading}
          />
        ) : (
          <List
            virtualized={virtualized}
            items={demoRows}
            isLoading={isLoading}
            itemContent={(_, row) => (
              <article className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="font-medium">{row.claim}</h2>
                    <p className="text-muted-foreground text-sm">
                      {row.policyholder}
                    </p>
                  </div>
                  {renderStatus(row.status)}
                </div>
              </article>
            )}
          />
        )}
      </div>
    </section>
  )
}

export default Scrap
