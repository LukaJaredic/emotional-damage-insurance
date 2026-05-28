import { useSyncExternalStore } from 'react'

function getSnapshot(query: string) {
  return window.matchMedia(query).matches
}

function subscribe(callback: () => void, mediaQueryList: MediaQueryList) {
  mediaQueryList.addEventListener('change', callback)

  return () => {
    mediaQueryList.removeEventListener('change', callback)
  }
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => subscribe(callback, window.matchMedia(query)),
    () => getSnapshot(query),
  )
}

export default useMediaQuery
