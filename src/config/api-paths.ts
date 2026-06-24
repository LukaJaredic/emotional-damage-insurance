export const apiPaths = {
  auth: {
    login: () => '/auth/login',
    logout: () => '/auth/logout',
    me: () => '/auth/me',
  },
  users: {
    all: () => '/users',
    one: (userId: string) => `/users/${userId}`,
  },
  policyHolders: {
    all: () => '/policy-holders',
    one: (policyHolderId: string) => `/policy-holders/${policyHolderId}`,
  },
} as const
