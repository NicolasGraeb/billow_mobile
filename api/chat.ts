import type { AuthorizedFetch } from "@/api/client";
import { ensureOk, parseArray, parseJson } from "@/api/client";
import type { ChatMessage } from "@/types/api";
import { API_ENDPOINTS } from "@/urls/api";

export function normalizeChatMessage(m: Record<string, unknown>): ChatMessage {
  return {
    id: Number(m.id),
    event_id: Number(m.event_id ?? m.eventId),
    sender: {
      id: Number((m.sender as Record<string, unknown>)?.id),
      username: String((m.sender as Record<string, unknown>)?.username ?? ""),
      email: String((m.sender as Record<string, unknown>)?.email ?? ""),
      avatar_url: (() => {
        const s = m.sender as Record<string, unknown>;
        const url = s?.avatar_url ?? s?.avatarUrl;
        return typeof url === "string" ? url : null;
      })(),
    },
    content: String(m.content ?? ""),
    created_at: String(m.created_at ?? m.createdAt ?? ""),
  };
}

export const chatApi = {
  getMessages: async (
    fetchFn: AuthorizedFetch,
    eventId: number,
    options?: { beforeId?: number; limit?: number }
  ): Promise<ChatMessage[]> => {
    const params = new URLSearchParams();
    if (options?.beforeId) params.append("before_id", String(options.beforeId));
    params.append("limit", String(options?.limit ?? 30));

    const base = API_ENDPOINTS.EVENTS.CHAT_MESSAGES(eventId);
    const url = params.toString() ? `${base}?${params.toString()}` : base;
    const response = await fetchFn(url, { method: "GET" });
    await ensureOk(response, "Nie udało się pobrać wiadomości");
    const data = await parseJson<unknown>(response);
    const list = parseArray<Record<string, unknown>>(data);
    return list.map(normalizeChatMessage);
  },
};
