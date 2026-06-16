/**
 * `useInfiniteQuery` helper - calculates the next page param based on the length of the last page, you can pass it as-is.
 * It will allow you to fetch the next page until the last page is empty, at which point it will stop fetching more pages.
 */
function getNextPageParam<T>(
  lastPage: T[],
  pages: T[][],
  lastPageParam: number,
): number | undefined {
  if (
    lastPage.length === 0 ||
    (pages.length > 1 && lastPage.length < pages[0]!.length) // last page is not full - no more loads
  ) {
    return undefined
  }

  return lastPageParam + 1
}

/**
 * `useInfiniteQuery` helper - common query options for infinite queries: initial page param and get next page param function.
 * You can import and use it as-is in your infinite queries.
 */
const commonQueryOptions = {
  retry: false,
  initialPageParam: 1,
  getNextPageParam,
}

export { commonQueryOptions }
