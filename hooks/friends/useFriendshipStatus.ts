import { usersApi } from "@/api/users";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export const useFriendshipStatus = (userId: number, enabled = true) => {
  const { fetch, isAuthenticated } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.friends.status(userId),
    queryFn: () => usersApi.getFriendshipStatus(fetch, userId),
    enabled: enabled && isAuthenticated && userId > 0,
    staleTime: 2 * 60_000,
  });

  return {
    status: query.data ?? null,
    loading: query.isLoading,
  };
};
