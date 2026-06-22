import { createContext } from 'react'

import type { PermissionsBuilder } from '@/utils'

export type PermissionsContextValue = ReturnType<PermissionsBuilder['build']>

export const PermissionsContext = createContext<
  PermissionsContextValue | undefined
>(undefined)
