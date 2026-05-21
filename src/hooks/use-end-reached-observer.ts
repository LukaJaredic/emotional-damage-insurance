import { useEffect, useRef } from 'react'

type UseEndReachedObserverParams = {
  itemCount: number
  onEndReached: (lastIndex: number) => void
}

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
