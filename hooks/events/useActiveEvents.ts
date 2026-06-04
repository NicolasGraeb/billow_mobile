import { ACTIVE_PAGE_SIZE, eventsApi } from "@/api/events";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useActiveEvents = (enabled = true) => {
  const { fetch, isAuthenticated } = useAuthorizedApi();

  const query = useInfiniteQuery({
    queryKey: queryKeys.events.active,
    queryFn: ({ pageParam }) => eventsApi.getActivePage(fetch, pageParam, ACTIVE_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: enabled && isAuthenticated,
  });

  const events = query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    events,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage ?? false,
    error: query.error instanceof Error ? query.error.message : null,
    loadMore: query.fetchNextPage,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};
