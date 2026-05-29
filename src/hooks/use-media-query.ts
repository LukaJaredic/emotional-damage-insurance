import { useRef, useSyncExternalStore } from 'react'

function subscribe(callback: () => void, mediaQueryList: MediaQueryList) {
  mediaQueryList.addEventListener('change', callback)

  return () => {
    mediaQueryList.removeEventListener('change', callback)
  }
}

/**
 * Subscribes to a media query and returns whether it currently matches.
 *
 * @param query Media query string to observe.
 * @returns Whether the media query currently matches.
 */
function useMediaQuery(query: string) {
  const mediaQueryRef = useRef(window.matchMedia(query))
  return useSyncExternalStore(
    (callback) => subscribe(callback, mediaQueryRef.current),
    () => mediaQueryRef.current.matches,
  )
}

export default useMediaQuery
