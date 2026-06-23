import ErrorBoundary from '@/components/errors/error-boundary'

import AppRouter from './router'

function App() {
  return (
    <ErrorBoundary variant="page" actions="back-home-retry">
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App
