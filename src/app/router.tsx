import { Suspense, lazy } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import { Spinner } from '@/components/ui'
import { paths } from '@/config'
import type { PageAccess } from '@/utils'

import AppLayout from './app-layout'
import AuthGuard from './auth-guard'
import AppProvider from './providers/app-provider'

const HomePage = lazy(() => import('@app/routes/home/home-page'))
const LoginPage = lazy(() => import('@app/routes/auth/login-page'))
const NotFoundPage = lazy(() => import('@app/routes/not-found-page'))
const UsersMasterPage = lazy(
  () => import('@app/routes/users/users-master-page'),
)
const UserDetailPage = lazy(() => import('@app/routes/users/user-detail-page'))

function withSuspense(page: React.ReactNode) {
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

function protectedRoute(pageName: PageAccess, page: React.ReactNode) {
  return (
    <AuthGuard page={pageName}>
      <AppLayout>{withSuspense(page)}</AppLayout>
    </AuthGuard>
  )
}

function unprotectedRoute(page: React.ReactNode) {
  return <AuthGuard shouldHaveUser={false}>{withSuspense(page)}</AuthGuard>
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
        element: withSuspense(<NotFoundPage />),
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
        path: '*',
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
