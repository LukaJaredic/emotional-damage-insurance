import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { ErrorBoundary } from '@/components/errors'
import { Spinner } from '@/components/ui'
import { paths } from '@/config'
import type { PageAccess } from '@/utils'

import AppLayout from './app-layout'
import AuthGuard from './auth-guard'
import AppProvider from './providers/app-provider'

const HomePage = lazy(() => import('@app/routes/home/home-page'))
const LoginPage = lazy(() => import('@app/routes/auth/login-page'))
const NotFoundPage = lazy(() => import('@app/routes/not-found-page'))

// USERS
const UsersMasterPage = lazy(
  () => import('@app/routes/users/users-master-page'),
)
const UserDetailPage = lazy(() => import('@app/routes/users/user-detail-page'))

// POLICY HOLDERS
const PolicyHoldersMasterPage = lazy(
  () => import('@app/routes/policy-holders/policy-holders-master-page'),
)
const PolicyHolderDetailPage = lazy(
  () => import('@app/routes/policy-holders/policy-holder-detail-page'),
)

function withSuspense(page: ReactNode) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh w-full items-center justify-center">
          <Spinner className="size-8" />
        </main>
      }
    >
      {page}
    </Suspense>
  )
}

function withErrorBoundary(page: ReactNode) {
  return <ErrorBoundary>{page}</ErrorBoundary>
}

function protectedRoute(pageName: PageAccess, page: ReactNode) {
  return (
    <AuthGuard page={pageName}>
      <AppLayout>{withErrorBoundary(withSuspense(page))}</AppLayout>
    </AuthGuard>
  )
}

function unprotectedRoute(page: ReactNode) {
  return (
    <AuthGuard shouldHaveUser={false}>
      {withErrorBoundary(withSuspense(page))}
    </AuthGuard>
  )
}

const router = createBrowserRouter([
  {
    element: <AppProvider />,
    children: [
      {
        path: paths.auth.login.path,
        element: unprotectedRoute(<LoginPage />),
      },
      {
        path: paths.notFound.path,
        element: withErrorBoundary(withSuspense(<NotFoundPage />)),
      },
      {
        path: paths.root.path,
        element: protectedRoute('home', <HomePage />),
      },
      {
        path: paths.users.path,
        element: protectedRoute('users:master-page', <UsersMasterPage />),
      },
      {
        path: paths.users.detail.path,
        element: protectedRoute('users:detail-page', <UserDetailPage />),
      },
      {
        path: paths.policyHolders.path,
        element: protectedRoute(
          'policy-holders:master-page',
          <PolicyHoldersMasterPage />,
        ),
      },
      {
        path: paths.policyHolders.detail.path,
        element: protectedRoute(
          'policy-holders:detail-page',
          <PolicyHolderDetailPage />,
        ),
      },
      {
        path: '*',
        element: withErrorBoundary(withSuspense(<NotFoundPage />)),
      },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
