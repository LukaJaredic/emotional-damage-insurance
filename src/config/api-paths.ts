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
  policies: {
    all: () => '/policies',
    one: (policyId: string) => `/policies/${policyId}`,
    terminate: (policyId: string) => `/policies/${policyId}/terminate`,
    reactivate: (policyId: string) => `/policies/${policyId}/reactivate`,
    users: (policyId: string) => `/policies/${policyId}/users`,
    user: (policyId: string, userId: string) =>
      `/policies/${policyId}/users/${userId}`,
  },
} as const
