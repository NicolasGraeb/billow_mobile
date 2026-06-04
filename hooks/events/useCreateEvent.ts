import { eventsApi } from "@/api/events";
import { invalidateEvents } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import type { CreateEventPayload } from "@/types/api";
import { useMutation } from "@tanstack/react-query";

export type { CreateEventPayload };

export const useCreateEvent = () => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsApi.create(fetch, payload),
    onSuccess: () => invalidateEvents(),
  });

  return {
    createEvent: mutation.mutateAsync,
    creating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
