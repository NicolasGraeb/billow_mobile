import { friendsApi } from "@/api/friends";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export type { FriendRelation, FriendUser } from "@/types/api";

type UseFriendsListOptions = {
  enabled?: boolean;
};

export const useFriendsList = (options?: UseFriendsListOptions) => {
  const { fetch, isAuthenticated } = useAuthorizedApi();
  const enabled = (options?.enabled ?? true) && isAuthenticated;

  const query = useQuery({
    queryKey: queryKeys.friends.list,
    queryFn: () => friendsApi.list(fetch),
    enabled,
  });

  return {
    friends: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    fetchFriends: query.refetch,
  };
};
