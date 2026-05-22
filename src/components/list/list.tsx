import { cn } from '@/lib/utils'

import type { ListProps } from './list.types'
import StaticList from './static-list'
import VirtualizedList from './virtualized-list'

function List<T>({ virtualized = false, className, ...props }: ListProps<T>) {
  const sharedClassName = cn('h-full min-h-0 border rounded-xl', className)

  if (virtualized) {
    return <VirtualizedList {...props} className={sharedClassName} />
  }

  return <StaticList {...props} className={sharedClassName} />
}

export default List
