import { captureReactException } from '@sentry/react'
import type { ReactNode } from 'react'
import {
  getErrorMessage,
  ErrorBoundary as ReactErrorBoundary,
} from 'react-error-boundary'
import { useLocation } from 'react-router'

import Error, { type ErrorProps } from './error'

type ErrorBoundaryProps = {
  children: ReactNode
  variant?: ErrorProps['variant']
  actions?: ErrorProps['actions']
}

function ErrorBoundary({
  children,
  variant = 'container',
  actions = 'back-home-retry',
}: ErrorBoundaryProps) {
  const location = useLocation()

  return (
    <ReactErrorBoundary
      resetKeys={[location.key]}
      fallbackRender={(error) => (
        <Error
          status="ERROR"
          title="Something went wrong"
          description={
            getErrorMessage(error.error) || 'An unexpected error occurred.'
          }
          variant={variant}
          actions={actions}
        />
      )}
      onError={(error, info) => {
        console.error('ErrorBoundary caught an error:', error, info)
        captureReactException(error, info)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
