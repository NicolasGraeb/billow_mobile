import { friendsApi } from "@/api/friends";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import { invalidateFriends } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useMutation } from "@tanstack/react-query";

export const useSendFriendRequest = () => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (userId: number) => friendsApi.sendRequest(fetch, userId),
    onSuccess: (data, userId) => {
      invalidateFriends();
      const status = data?.status === "accepted" ? "accepted" : "pending";
      queryClient.setQueryData(queryKeys.friends.status(userId), {
        status,
        friendship_id: data?.id,
        is_sender: status === "pending",
      });
    },
  });

  return {
    sendRequest: mutation.mutateAsync,
    sendingUserId: mutation.isPending ? mutation.variables : null,
    isPending: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
