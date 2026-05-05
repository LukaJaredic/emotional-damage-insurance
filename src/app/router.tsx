import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import { paths } from '@/config/paths'

const LoginPage = lazy(() => import('@app/routes/login-page'))

function withSuspense(page: ReactNode) {
  return (
    <Suspense fallback={<main className="p-6">Loading...</main>}>
      {page}
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    path: paths.root,
    element: <Navigate to={paths.auth.login.path} replace />,
  },
  {
    path: paths.auth.login.path,
    element: withSuspense(<LoginPage />),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
