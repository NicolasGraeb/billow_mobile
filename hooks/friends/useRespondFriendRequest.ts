import { friendsApi } from "@/api/friends";
import { invalidateFriends, invalidateProfile } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useMutation } from "@tanstack/react-query";

export const useAcceptFriendRequest = () => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (friendshipId: number) => friendsApi.accept(fetch, friendshipId),
    onSuccess: () => {
      invalidateFriends();
      invalidateProfile();
    },
  });

  return {
    accept: mutation.mutateAsync,
    processingId: mutation.isPending ? mutation.variables : null,
    isPending: mutation.isPending,
  };
};

export const useRejectFriendRequest = () => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (friendshipId: number) => friendsApi.reject(fetch, friendshipId),
    onSuccess: () => invalidateFriends(),
  });

  return {
    reject: mutation.mutateAsync,
    processingId: mutation.isPending ? mutation.variables : null,
    isPending: mutation.isPending,
  };
};
