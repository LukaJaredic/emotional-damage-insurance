/**
 * Helper - stops propagation of any event
 * @param e The event to stop propagation for
 */
function stopPropagation(e: React.SyntheticEvent) {
  e.stopPropagation()
}

export { stopPropagation }
