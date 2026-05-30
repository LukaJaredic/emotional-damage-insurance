import { useEffect, useRef } from 'react'

type UseEndReachedObserverParams = {
  itemCount: number
  onEndReached: (lastIndex: number) => void
}

/**
 * Creates a ref that triggers a callback when the end marker enters the viewport.
 *
 * @param itemCount Number of items currently rendered in the list/table.
 * @param onEndReached Callback invoked with the last rendered item index.
 * @returns A ref to attach to the end-of-list marker element.
 */
function useEndReachedObserver({
  itemCount,
  onEndReached,
}: UseEndReachedObserverParams) {
  const endReachedRef = useRef<HTMLDivElement>(null)
  const lastEmittedIndexRef = useRef<number | null>(null)

  useEffect(() => {
    const element = endReachedRef.current
    const lastIndex = itemCount - 1

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
  }, [itemCount, onEndReached])

  return endReachedRef
}

export default useEndReachedObserver
