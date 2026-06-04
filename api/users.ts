import type { AuthorizedFetch } from "@/api/client";
import { parsePaginated, requestJson } from "@/api/client";
import type { FriendshipStatus, UserSummary } from "@/types/api";
import { API_BASE_URL } from "@/urls/urls";
import { API_ENDPOINTS } from "@/urls/api";

export const SEARCH_USERS_PAGE_SIZE = 20;
export const PARTICIPANT_SEARCH_PAGE_SIZE = 20;

export const usersApi = {
  search: async (fetchFn: AuthorizedFetch, query: string, page: number, size = SEARCH_USERS_PAGE_SIZE) => {
    const url = `${API_ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(query)}&page=${page}&size=${size}`;
    const data = await requestJson<unknown>(
      fetchFn,
      url,
      { method: "GET" },
      "Nie udało się wyszukać użytkowników"
    );
    return parsePaginated<UserSummary>(data, page, size);
  },

  getFriendshipStatus: (fetchFn: AuthorizedFetch, userId: number) =>
    requestJson<FriendshipStatus>(
      fetchFn,
      `${API_BASE_URL}/users/friendship-status/${userId}`,
      { method: "GET" },
      "Nie udało się sprawdzić statusu znajomości"
    ),
};
