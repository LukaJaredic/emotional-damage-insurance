import { forwardRef } from 'react'
import {
  type Components,
  Virtuoso,
  type ItemProps as VirtuosoItemProps,
  type ListProps as VirtuosoListProps,
} from 'react-virtuoso'

import { Spinner } from '@/components/ui'

import type { BaseListProps } from './list.types'

type ListContext = {
  isLoading: boolean
  itemCount: number
}

const VirtuosoList = forwardRef<HTMLDivElement, VirtuosoListProps>(
  (
    {
      children,
      context,
      ...props
    }: VirtuosoListProps & { context?: ListContext },
    ref,
  ) => {
    const isLoading = context?.isLoading ?? false

    return (
      <div
        ref={ref}
        data-slot="list"
        role="list"
        aria-busy={isLoading}
        className="px-2"
        {...props}
      >
        {children}
      </div>
    )
  },
)

VirtuosoList.displayName = 'VirtuosoList'

const virtuosoListComponents: Components<unknown, ListContext> = {
  List: VirtuosoList,
  Item: ({
    children,
    context,
    item,
    ...props
  }: VirtuosoItemProps<unknown> & { context: ListContext }) => {
    void item

    return (
      <div
        data-slot="list-item"
        role="listitem"
        aria-posinset={props['data-item-index'] + 1}
        aria-setsize={context.itemCount}
        className="pb-6 first:pt-2"
        {...props}
      >
        {children}
      </div>
    )
  },
  Footer: ({ context }) => {
    if (!context.isLoading) {
      return null
    }

    return (
      <div className="bg-primary/50 flex justify-center py-4">
        <div role="status" aria-live="polite" className="flex items-center">
          <span aria-hidden="true">
            <Spinner />
          </span>
          <span className="sr-only">Loading more items</span>
        </div>
      </div>
    )
  },
}

/**
 * Renders a virtualized list with end-reached detection and loading feedback.
 *
 * @param items Items rendered in the list.
 * @param itemContent Render function used for each list item.
 * @param isLoading Whether some items are currently loading.
 * @param className Optional class name applied to the list container.
 * @param onEndReached Callback invoked when the end of the list is reached - called only once per `items.length`.
 */
function VirtualizedList<T>({
  items,
  itemContent,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: BaseListProps<T>) {
  return (
    <div className={className}>
      <Virtuoso
        context={{ isLoading, itemCount: items.length }}
        data={items}
        totalCount={items.length}
        style={{ height: '100%' }}
        endReached={onEndReached}
        components={virtuosoListComponents as Components<T, ListContext>}
        itemContent={itemContent}
      />
    </div>
  )
}

export default VirtualizedList
