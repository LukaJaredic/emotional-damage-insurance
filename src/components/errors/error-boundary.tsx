import {
  getErrorMessage,
  ErrorBoundary as ReactErrorBoundary,
  type ErrorBoundaryPropsWithRender,
} from 'react-error-boundary'

import Error, { type ErrorProps } from './error'

type ErrorBoundaryProps = {
  children: React.ReactNode
  variant?: ErrorProps['variant']
  actions?: ErrorProps['actions']
  fallBackRender?: ErrorBoundaryPropsWithRender['fallbackRender']
}

function ErrorBoundary({
  children,
  variant = 'container',
  actions = 'back-home-retry',
  fallBackRender,
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={
        fallBackRender ||
        ((error) => (
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
        ))
      }
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
