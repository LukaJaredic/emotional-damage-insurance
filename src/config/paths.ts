export const paths = {
  root: {
    path: '/',
    getHref: () => '/',
  },
  users: {
    path: '/users',
    getHref: () => '/users',
  },
  notFound: {
    path: '/404',
    getHref: () => '/404',
  },
  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
}
