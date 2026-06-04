import type { AuthorizedFetch } from "@/api/client";
import { parseArray, requestJson } from "@/api/client";
import type { FriendRelation, FriendRequest } from "@/types/api";
import { API_ENDPOINTS } from "@/urls/api";

const normalizeRequest = (request: Record<string, unknown>): FriendRequest => ({
  id: Number(request?.id),
  from_user: (request?.from_user ?? request?.fromUser ?? null) as FriendRequest["from_user"],
  to_user: (request?.to_user ?? request?.toUser ?? null) as FriendRequest["to_user"],
  status: String(request?.status ?? ""),
  created_at: String(request?.created_at ?? request?.createdAt ?? ""),
});

export const friendsApi = {
  list: async (fetchFn: AuthorizedFetch): Promise<FriendRelation[]> => {
    const data = await requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.FRIENDS.LIST,
      { method: "GET" },
      "Nie udało się pobrać znajomych"
    );
    return parseArray<FriendRelation>(data);
  },

  getPending: async (fetchFn: AuthorizedFetch): Promise<FriendRequest[]> => {
    const data = await requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.FRIENDS.PENDING,
      { method: "GET" },
      "Nie udało się pobrać zaproszeń"
    );
    return parseArray<Record<string, unknown>>(data).map(normalizeRequest);
  },

  getSent: async (fetchFn: AuthorizedFetch): Promise<FriendRequest[]> => {
    const data = await requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.FRIENDS.SENT,
      { method: "GET" },
      "Nie udało się pobrać zaproszeń"
    );
    return parseArray<Record<string, unknown>>(data).map(normalizeRequest);
  },

  accept: (fetchFn: AuthorizedFetch, friendshipId: number) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.FRIENDS.ACCEPT(friendshipId),
      { method: "POST" },
      "Nie udało się zaakceptować zaproszenia"
    ),

  reject: (fetchFn: AuthorizedFetch, friendshipId: number) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.FRIENDS.REJECT(friendshipId),
      { method: "POST" },
      "Nie udało się odrzucić zaproszenia"
    ),

  sendRequest: (fetchFn: AuthorizedFetch, userId: number) =>
    requestJson<{ id: number; status: string }>(
      fetchFn,
      API_ENDPOINTS.FRIENDS.REQUEST(userId),
      { method: "POST" },
      "Nie udało się wysłać zaproszenia"
    ),
};
