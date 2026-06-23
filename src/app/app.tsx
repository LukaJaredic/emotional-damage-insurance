import ErrorBoundary from '@/components/errors/error-boundary'
import { Button } from '@/components/ui/shadcn/button'

import AppRouter from './router'

function App() {
  return (
    <ErrorBoundary
      fallBackRender={() => (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-gray-100 p-4 text-center">
          <h1 className="text-destructive text-2xl font-bold">
            Critical app error
          </h1>
          <p>
            Something went wrong, app could not initialize, the issue has been
            reported.
          </p>
          <Button
            variant="destructive"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      )}
    >
      <AppRouter />
    </ErrorBoundary>
  )
}

export default App
