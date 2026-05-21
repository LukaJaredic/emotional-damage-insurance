import * as React from 'react'

import { cn } from '@/lib/utils'

import type { BaseListProps, ListItemWithOptionalId } from './list.types'
import Spinner from './spinner'

function StaticList<T>({
  items,
  itemContent,
  isLoading = false,
  className,
  onEndReached = (lastIndex) => void lastIndex,
}: BaseListProps<T>) {
  const endReachedRef = React.useRef<HTMLDivElement>(null)
  const lastEmittedIndexRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const element = endReachedRef.current
    const lastIndex = items.length - 1

    if (!element || lastIndex < 0) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) {
        return
      }

      if (lastEmittedIndexRef.current === lastIndex) {
        return
      }

      lastEmittedIndexRef.current = lastIndex
      onEndReached(lastIndex)
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [items.length, onEndReached])

  return (
    <ul
      aria-busy={isLoading}
      className={cn('relative max-h-full space-y-6 overflow-auto', className)}
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
        <li className="flex justify-center py-4">
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
