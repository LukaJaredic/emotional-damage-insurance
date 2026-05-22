import useEndReachedObserver from '@/hooks/use-end-reached-observer'
import { cn } from '@/lib/utils'
import Spinner from '@components/spinner'

import type { BaseListProps, ListItemWithOptionalId } from './list.types'

function StaticList<T>({
  items,
  itemContent,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: BaseListProps<T>) {
  const endReachedRef = useEndReachedObserver({
    itemCount: items.length,
    onEndReached,
  })

  return (
    <ul
      aria-busy={isLoading}
      className={cn(
        'relative max-h-full space-y-6 overflow-auto p-2',
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={(item as ListItemWithOptionalId)?.id ?? index}>
          {itemContent(index, item)}
        </li>
      ))}

      <li aria-hidden="true" className="h-px">
        <div ref={endReachedRef} />
      </li>

      {isLoading ? (
        <li className="bg-primary/50 flex justify-center py-4">
          <div role="status" aria-live="polite" className="flex items-center">
            <span aria-hidden="true">
              <Spinner />
            </span>
            <span className="sr-only">Loading more items</span>
          </div>
        </li>
      ) : null}
    </ul>
  )
}

export default StaticList
