function getNextPageParam<T>(
  lastPage: T[],
  _allPages: T[][],
  lastPageParam: number,
): number | undefined {
  if (lastPage.length === 0) {
    return undefined
  }

  return lastPageParam + 1
}

const commonQueryOptions = {
  initialPageParam: 1,
  getNextPageParam,
}

export { commonQueryOptions }
