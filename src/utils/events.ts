import type { SyntheticEvent } from 'react'

/**
 * Helper - stops propagation of any event
 * @param e The event to stop propagation for
 */
function stopPropagation(e: SyntheticEvent) {
  e.stopPropagation()
}

export { stopPropagation }
