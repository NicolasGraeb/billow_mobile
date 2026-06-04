import { SEARCH_USERS_PAGE_SIZE, usersApi } from "@/api/users";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useInfiniteQuery } from "@tanstack/react-query";

export type { UserSummary as SearchUser } from "@/types/api";

const MIN_QUERY_LENGTH = 2;

export const useSearchUsers = (query: string) => {
  const { fetch, isAuthenticated } = useAuthorizedApi();
  const trimmed = query.trim();
  const enabled = isAuthenticated && trimmed.length >= MIN_QUERY_LENGTH;

  const infiniteQuery = useInfiniteQuery({
    queryKey: queryKeys.users.search(trimmed),
    queryFn: ({ pageParam }) => usersApi.search(fetch, trimmed, pageParam, SEARCH_USERS_PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled,
  });

  const users = infiniteQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    users,
    loading: infiniteQuery.isLoading || infiniteQuery.isFetching,
    hasMore: infiniteQuery.hasNextPage ?? false,
    error: infiniteQuery.error instanceof Error ? infiniteQuery.error.message : null,
    loadMore: infiniteQuery.fetchNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
  };
};
