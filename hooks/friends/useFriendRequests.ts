import { friendsApi } from "@/api/friends";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export type { FriendRequest } from "@/types/api";

export const useFriendRequests = (enabled = false) => {
  const { fetch } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.friends.requests,
    queryFn: async () => {
      const [received, sent] = await Promise.all([
        friendsApi.getPending(fetch),
        friendsApi.getSent(fetch),
      ]);
      return { received, sent };
    },
    enabled,
  });

  return {
    receivedRequests: query.data?.received ?? [],
    sentRequests: query.data?.sent ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
