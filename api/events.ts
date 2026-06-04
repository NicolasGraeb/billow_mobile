import type { AuthorizedFetch } from "@/api/client";
import { parsePaginated, requestJson } from "@/api/client";
import type { CreateEventPayload, EventDetail, EventSummary } from "@/types/api";
import { API_ENDPOINTS } from "@/urls/api";

const ACTIVE_PAGE_SIZE = 5;

export const eventsApi = {
  getActivePage: async (fetchFn: AuthorizedFetch, page: number, size = ACTIVE_PAGE_SIZE) => {
    const url = `${API_ENDPOINTS.EVENTS.ACTIVE}?page=${page}&size=${size}`;
    const data = await requestJson<unknown>(fetchFn, url, { method: "GET" }, "Nie udało się pobrać eventów");
    return parsePaginated<EventDetail>(data, page, size);
  },

  getMyEvents: (fetchFn: AuthorizedFetch) =>
    requestJson<EventSummary[]>(fetchFn, API_ENDPOINTS.EVENTS.ME, { method: "GET" }, "Nie udało się pobrać eventów"),

  getById: (fetchFn: AuthorizedFetch, eventId: number) =>
    requestJson<EventDetail>(
      fetchFn,
      API_ENDPOINTS.EVENTS.GET(eventId),
      { method: "GET" },
      "Nie udało się pobrać eventu"
    ),

  create: (fetchFn: AuthorizedFetch, payload: CreateEventPayload) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EVENTS.CREATE,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      "Nie udało się utworzyć eventu"
    ),

  finish: (fetchFn: AuthorizedFetch, eventId: number) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EVENTS.FINISH(eventId),
      { method: "POST" },
      "Nie udało się zakończyć eventu"
    ),

  addParticipant: (fetchFn: AuthorizedFetch, eventId: number, userId: number) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EVENTS.ADD_PARTICIPANT(eventId, userId),
      { method: "POST" },
      "Nie udało się dodać uczestnika"
    ),
};

export { ACTIVE_PAGE_SIZE };
