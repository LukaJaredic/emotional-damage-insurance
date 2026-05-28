import { useRef, useSyncExternalStore } from 'react'

function subscribe(callback: () => void, mediaQueryList: MediaQueryList) {
  mediaQueryList.addEventListener('change', callback)

  return () => {
    mediaQueryList.removeEventListener('change', callback)
  }
}

function useMediaQuery(query: string) {
  const mediaQueryRef = useRef(window.matchMedia(query))
  return useSyncExternalStore(
    (callback) => subscribe(callback, mediaQueryRef.current),
    () => mediaQueryRef.current.matches,
  )
}

export default useMediaQuery
