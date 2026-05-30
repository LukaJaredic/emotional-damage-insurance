import { createContext } from 'react'

import type { PermissionsBuilder } from '@/utils'

export type PermissionsContextValue = {
  can: ReturnType<PermissionsBuilder['build']>['can']
}

export const PermissionsContext = createContext<
  PermissionsContextValue | undefined
>(undefined)
