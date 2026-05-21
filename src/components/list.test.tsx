import { render, screen, waitFor } from '@testing-library/react'
import { VirtuosoMockContext } from 'react-virtuoso'
import { describe, expect, it, vi } from 'vitest'

import { mockIsIntersecting } from '@/testing/intersection-observer-stub'

import List from './list'
import type { ListProps } from './list.types'

type DemoItem = {
  id: string
  name: string
}

const items: DemoItem[] = [
  {
    id: '1',
    name: 'Jane Doe',
  },
]

function getEndReachedSentinel(container: HTMLElement) {
  const sentinel = container.querySelector('[aria-hidden="true"] > div')

  if (!sentinel) {
    throw new Error('Expected end reached sentinel to be rendered')
  }

  return sentinel
}

function renderList(props?: Partial<ListProps<DemoItem>>) {
  return render(
    <div className="h-96">
      <List
        items={props?.items ?? items}
        isLoading={props?.isLoading ?? false}
        virtualized={props?.virtualized ?? false}
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

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
  })

  it('should render semantic virtualized list markup', () => {
    renderList({ virtualized: true })

    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toBeInTheDocument()
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
    const rendered = renderList({ onEndReached })

    mockIsIntersecting(getEndReachedSentinel(rendered.container), true)

    await waitFor(() => {
      expect(onEndReached).toHaveBeenCalledWith(0)
    })
  })

  it('should call onEndReached in virtualized mode', async () => {
    const onEndReached = vi.fn()

    renderList({ onEndReached, virtualized: true })

    await waitFor(() => {
      expect(onEndReached).toHaveBeenCalledWith(0)
    })
  })

  it('should only call non-virtualized onEndReached once per item count', async () => {
    const onEndReached = vi.fn()

    const rendered = renderList({ onEndReached })
    const sentinel = getEndReachedSentinel(rendered.container)

    mockIsIntersecting(sentinel, true)
    mockIsIntersecting(sentinel, true)

    expect(onEndReached).toHaveBeenCalledTimes(1)
    expect(onEndReached).toHaveBeenCalledWith(0)

    rendered.rerender(
      <div className="h-96">
        <List
          items={[...items, { id: '2', name: 'John Doe' }]}
          isLoading={false}
          className=""
          onEndReached={onEndReached}
          itemContent={(_, item) => <span>{item.name}</span>}
        />
      </div>,
    )

    mockIsIntersecting(getEndReachedSentinel(rendered.container), true)

    expect(onEndReached).toHaveBeenCalledTimes(2)
    expect(onEndReached).toHaveBeenLastCalledWith(1)
  })

  it('should expose loading state and loading footer', () => {
    renderList({ isLoading: true })

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Loading more items')
    expect(screen.getByTitle('Loading...')).toBeInTheDocument()
  })

  it('should expose loading state in virtualized mode', () => {
    renderList({ isLoading: true, virtualized: true })

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Loading more items')
    expect(screen.getByTitle('Loading...')).toBeInTheDocument()
  })
})
