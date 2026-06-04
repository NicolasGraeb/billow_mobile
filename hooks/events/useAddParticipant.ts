import { eventsApi } from "@/api/events";
import { invalidateEventDetail } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useMutation } from "@tanstack/react-query";

export const useAddParticipant = (eventId: number) => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (userId: number) => eventsApi.addParticipant(fetch, eventId, userId),
    onSuccess: () => invalidateEventDetail(eventId),
  });

  return {
    addParticipant: mutation.mutateAsync,
    adding: mutation.isPending,
    addingUserId: mutation.isPending ? mutation.variables : null,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
