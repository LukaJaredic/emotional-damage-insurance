import {
  getErrorMessage,
  ErrorBoundary as ReactErrorBoundary,
} from 'react-error-boundary'

import Error, { type ErrorProps } from './error'

type ErrorBoundaryProps = {
  children: React.ReactNode
  variant?: ErrorProps['variant']
  actions?: ErrorProps['actions']
}

function ErrorBoundary({
  children,
  variant = 'container',
  actions = 'back-home-retry',
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={(error) => (
        <Error
          status="ERROR"
          title="Something went wrong"
          description={
            getErrorMessage(error.error) || 'An unexpected error occurred.'
          }
          variant={variant}
          actions={actions}
          onActionClick={error.resetErrorBoundary}
        />
      )}
      onError={(error, info) => {
        // TODO: Sentry logging
        console.error('ErrorBoundary caught an error:', error, info)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
