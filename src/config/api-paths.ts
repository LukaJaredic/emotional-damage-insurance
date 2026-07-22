export const apiPaths = {
  auth: {
    login: () => '/auth/login',
    logout: () => '/auth/logout',
    me: () => '/auth/me',
  },
  users: {
    all: () => '/users',
    one: (userId: string) => `/users/${userId}`,
    limits: (userId: string) => `/users/${userId}/limits`,
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
    connectedUsers: (policyId: string) =>
      `/policies/${policyId}/users/connected`,
    notConnectedUsers: (policyId: string) =>
      `/policies/${policyId}/users/not-connected`,
    user: (policyId: string, userId: string) =>
      `/policies/${policyId}/users/${userId}`,
  },
} as const
