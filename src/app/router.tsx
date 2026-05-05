import { Suspense, lazy } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import Spinner from '@/components/spinner'
import { paths } from '@/config/paths'

const HomePage = lazy(() => import('@app/routes/home-page'))
const LoginPage = lazy(() => import('@app/routes/login-page'))
const NotFoundPage = lazy(() => import('@app/routes/not-found-page'))

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

const router = createBrowserRouter([
  {
    path: paths.root.path,
    element: withSuspense(<HomePage />),
  },
  {
    path: paths.auth.login.path,
    element: withSuspense(<LoginPage />),
  },
  {
    path: paths.notFound.path,
    element: withSuspense(<NotFoundPage />),
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
])

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter
