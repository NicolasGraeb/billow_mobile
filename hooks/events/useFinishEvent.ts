import { eventsApi } from "@/api/events";
import { invalidateEventDetail, invalidateEvents } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useMutation } from "@tanstack/react-query";

export const useFinishEvent = (eventId: number) => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: () => eventsApi.finish(fetch, eventId),
    onSuccess: () => {
      invalidateEvents();
      invalidateEventDetail(eventId);
    },
  });

  return {
    finishEvent: mutation.mutateAsync,
    finishing: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
