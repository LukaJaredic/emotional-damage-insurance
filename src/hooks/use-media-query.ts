import { useEffect, useState } from 'react'

function getMatches(query: string) {
  if (typeof window === 'undefined') {
    return false
  }

  return window.matchMedia(query).matches
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    function updateMatches() {
      setMatches(getMatches(query))
    }

    updateMatches()
    window.addEventListener('resize', updateMatches)

    return () => window.removeEventListener('resize', updateMatches)
  }, [query])

  return matches
}

export default useMediaQuery
