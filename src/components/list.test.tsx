import { render, screen, waitFor } from '@testing-library/react'
import * as React from 'react'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it, vi } from 'vitest'

import List from './list'

type DemoItem = {
  id: string
  name: string
}

type ListProps = {
  items: DemoItem[]
  itemContent: (index: number, item: DemoItem) => React.ReactNode
  isLoading?: boolean
  className?: string
  onEndReached?: (lastIndex: number) => void
}

const items: DemoItem[] = [
  {
    id: '1',
    name: 'Jane Doe',
  },
]

function renderList(props?: Partial<ListProps>) {
  return render(
    <div className="h-96">
      <List
        items={props?.items ?? items}
        isLoading={props?.isLoading ?? false}
        className={props?.className ?? ''}
        onEndReached={props?.onEndReached ?? ((lastIndex) => void lastIndex)}
        itemContent={
          props?.itemContent ?? ((_, item) => <span>{item.name}</span>)
        }
      />
    </div>,
    {
      wrapper: ({ children }) => (
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 800, itemHeight: 50 }}
        >
          {children}
        </VirtuosoMockContext.Provider>
      ),
    },
  )
}

describe('List', () => {
  it('should render item content', () => {
    renderList()

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('should render semantic list markup', () => {
    renderList()

    const list = screen.getByRole('list')
    const item = screen.getByRole('listitem')

    expect(list.tagName).toBe('DIV')
    expect(item.tagName).toBe('DIV')
  })

  it('should render custom item markup', () => {
    renderList({
      itemContent: (_, item) => <article>Person: {item.name}</article>,
    })

    const item = screen.getByText('Person: Jane Doe')

    expect(item.tagName).toBe('ARTICLE')
  })

  it('should call onEndReached', async () => {
    const onEndReached = vi.fn()

    renderList({ onEndReached })

    await waitFor(() => {
      expect(onEndReached).toHaveBeenCalledWith(0)
    })
  })

  it('should expose loading state and loading footer', () => {
    renderList({ isLoading: true })

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Loading more items')
    expect(screen.getByTitle('Loading...')).toBeInTheDocument()
  })
})
