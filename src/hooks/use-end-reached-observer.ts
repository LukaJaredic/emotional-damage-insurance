import * as React from 'react'

type UseEndReachedObserverParams = {
  itemCount: number
  onEndReached: (lastIndex: number) => void
}

function useEndReachedObserver({
  itemCount,
  onEndReached,
}: UseEndReachedObserverParams) {
  const endReachedRef = React.useRef<HTMLDivElement>(null)
  const lastEmittedIndexRef = React.useRef<number | null>(null)

  React.useEffect(() => {
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
