import { useState } from 'react'
import { Link } from 'react-router-dom'

import DataView from './data-view/data-view'
import type { TableColumn } from './table/table.types'
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

function onEndReached(lastIndex: number) {
  alert('end reached ' + lastIndex)
}

function Scrap() {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmptyState, setShowEmptyState] = useState(false)
  const [virtualized, setVirtualized] = useState(false)
  const visibleRows = showEmptyState ? [] : demoRows

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold">
          Virtualized Data Views
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Demo of the responsive data view component rendering 20 claim rows as
          a table on desktop and a list on smaller screens.
        </p>
      </div>

      <div className="flex items-center gap-2">
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
        <Button
          type="button"
          variant="outline"
          aria-pressed={showEmptyState}
          onClick={() => setShowEmptyState((current) => !current)}
        >
          {showEmptyState ? 'Show demo rows' : 'Show empty state'}
        </Button>
      </div>

      <div className="h-128 overflow-hidden">
        <DataView
          items={visibleRows}
          tableColumns={demoColumns}
          tableCaption="Claims overview table"
          virtualized={virtualized}
          isLoading={isLoading}
          loadingContent="Loading claims..."
          emptyContent="No claims found"
          onEndReached={onEndReached}
          listItemContent={(_, row) => (
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
      </div>
    </section>
  )
}

export default Scrap
