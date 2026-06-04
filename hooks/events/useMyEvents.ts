import { eventsApi } from "@/api/events";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import type { EventSummary } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export const useMyEvents = (enabled = true) => {
  const { fetch, isAuthenticated } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.events.me,
    queryFn: async () => {
      const data = await eventsApi.getMyEvents(fetch);
      return [...data].sort(
        (a: EventSummary, b: EventSummary) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: enabled && isAuthenticated,
  });

  return {
    events: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
