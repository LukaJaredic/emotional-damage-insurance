export const paths = {
  root: {
    path: '/',
    getHref: () => '/',
  },
  users: {
    path: '/users',
    getHref: () => '/users',
    getDetailHref: (userId: string) => `/users/${userId}`,
    detail: {
      path: '/users/:userId',
      getHref: (userId: string) => `/users/${userId}`,
    },
  },
  policyHolders: {
    path: '/policy-holders',
    getHref: () => '/policy-holders',
    getDetailHref: (policyHolderId: string) =>
      `/policy-holders/${policyHolderId}`,
    detail: {
      path: '/policy-holders/:policyHolderId',
      getHref: (policyHolderId: string) => `/policy-holders/${policyHolderId}`,
    },
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
