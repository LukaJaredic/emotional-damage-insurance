import { render, screen } from '@testing-library/react'
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

function renderList(
  props?: Partial<ListProps<DemoItem>>,
): ReturnType<typeof render> {
  const sharedProps = {
    items: props?.items ?? items,
    isLoading: props?.isLoading ?? false,
    virtualized: props?.virtualized ?? false,
    onEndReached: props?.onEndReached ?? ((lastIndex) => void lastIndex),
    itemContent:
      props?.itemContent ??
      ((_: number, item: DemoItem) => <span>{item.name}</span>),
  }

  return render(
    <div className="h-96">
      <List {...sharedProps} />
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

function getEndReachedSentinel(container: HTMLElement): HTMLDivElement {
  const sentinel = container.querySelector('[aria-hidden="true"] > div')

  return sentinel as HTMLDivElement
}

function createListSuite(virtualized: boolean) {
  const label = virtualized ? 'Virtualized list' : 'Static list'

  describe(label, () => {
    it('should render default item content', () => {
      renderList({ virtualized })

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('should render custom item content', () => {
      renderList({
        virtualized,
        itemContent: (_, item) => <article>Person: {item.name}</article>,
      })

      const item = screen.getByText('Person: Jane Doe')

      expect(item.tagName).toBe('ARTICLE')
    })

    it('should render semantic list markup', () => {
      renderList({ virtualized })

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByRole('listitem')).toBeInTheDocument()
    })

    it('should only call #onEndReached() once per item count', async () => {
      const onEndReached = vi.fn()
      const nextItems = [...items, { id: '2', name: 'John Doe' }]
      const rendered = renderList({ virtualized, onEndReached })

      if (!virtualized) {
        const sentinel = getEndReachedSentinel(rendered.container)
        mockIsIntersecting(sentinel, true)
        mockIsIntersecting(sentinel, true)
      }

      expect(onEndReached).toHaveBeenCalledTimes(1)
      expect(onEndReached).toHaveBeenCalledWith(0)

      rendered.rerender(
        <div className="h-96">
          <List
            items={nextItems}
            virtualized={virtualized}
            onEndReached={onEndReached}
            itemContent={(_, item) => <span>{item.name}</span>}
          />
        </div>,
      )

      if (!virtualized) {
        mockIsIntersecting(getEndReachedSentinel(rendered.container), true)
      }

      expect(onEndReached).toHaveBeenCalledTimes(2)
      expect(onEndReached).toHaveBeenLastCalledWith(1)
    })

    it('should expose loading state', () => {
      renderList({ virtualized, isLoading: true })

      expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
      expect(screen.getByRole('status')).toHaveTextContent('Loading more items')
      expect(screen.getByTitle('Loading...')).toBeInTheDocument()
    })
  })
}

createListSuite(false)
createListSuite(true)
