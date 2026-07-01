export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  users: {
    detail: (userId: string) => ['users', userId] as const,
  },
}
