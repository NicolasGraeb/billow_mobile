import { chatApi } from "@/api/chat";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import type { ChatMessage } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export const useChatMessages = (eventId: number, enabled = true) => {
  const { fetch } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.chat.messages(eventId),
    queryFn: () => chatApi.getMessages(fetch, eventId, { limit: 30 }),
    enabled: enabled && eventId > 0,
    staleTime: 0,
  });

  return {
    messages: query.data ?? ([] as ChatMessage[]),
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};

export const fetchOlderChatMessages = (
  fetchFn: ReturnType<typeof useAuthorizedApi>["fetch"],
  eventId: number,
  beforeId: number
) => chatApi.getMessages(fetchFn, eventId, { beforeId, limit: 30 });
