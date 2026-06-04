import { eventsApi } from "@/api/events";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export const useEventDetail = (eventId: number | null, enabled = true) => {
  const { fetch, authLoading } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.events.detail(eventId ?? 0),
    queryFn: () => eventsApi.getById(fetch, eventId!),
    enabled: enabled && !authLoading && eventId != null && eventId > 0,
  });

  return {
    event: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
