import { API_BASE_URL } from "./urls";

/** Base URL for WebSocket (ws/wss). Use for STOMP endpoint /ws */
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

type AuthEndpoints = {
  LOGIN: string;
  REGISTER: string;
  REFRESH: string;
  ME: string;
};

type EventEndpoints = {
  ME: string;
  ACTIVE: string;
  CREATE: string;
  GET: (eventId: number) => string;
  FINISH: (eventId: number) => string;
  ADD_PARTICIPANT: (eventId: number, userId: number) => string;
  REMOVE_PARTICIPANT: (eventId: number, userId: number) => string;
  CHAT_MESSAGES: (eventId: number) => string;
  CHAT_WEBSOCKET: (eventId: number, token: string) => string;
  CHAT_STOMP_WS: (token: string) => string;
};

type ExpenseEndpoints = {
  CREATE: string;
  GET_BY_EVENT: (eventId: number) => string;
  UPDATE: (expenseId: number) => string;
  DELETE: (expenseId: number) => string;
  BALANCE: (eventId: number) => string;
};

type UserEndpoints = {
  SEARCH: string;
};

type FriendsEndpoints = {
  LIST: string;
  REQUEST: (friendId: number) => string;
  PENDING: string;
  SENT: string;
  ACCEPT: (friendshipId: number) => string;
  REJECT: (friendshipId: number) => string;
  DELETE: (friendshipId: number) => string;
};

type ApiEndpoints = {
  AUTH: AuthEndpoints;
  EVENTS: EventEndpoints;
  EXPENSES: ExpenseEndpoints;
  USERS: UserEndpoints;
  FRIENDS: FriendsEndpoints;
};

export const API_ENDPOINTS: ApiEndpoints = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  EVENTS: {
    ME: `${API_BASE_URL}/events/me`,
    ACTIVE: `${API_BASE_URL}/events/me/active`,
    /** Bez końcowego "/" — inaczej Spring robi redirect, a fetch często gubi nagłówek Authorization → 401 Unauthorized */
    CREATE: `${API_BASE_URL}/events`,
    GET: (eventId: number) => `${API_BASE_URL}/events/${eventId}`,
    FINISH: (eventId: number) => `${API_BASE_URL}/events/${eventId}/finish`,
    ADD_PARTICIPANT: (eventId: number, userId: number) => `${API_BASE_URL}/events/${eventId}/participants/${userId}`,
    REMOVE_PARTICIPANT: (eventId: number, userId: number) => `${API_BASE_URL}/events/${eventId}/participants/${userId}`,
    CHAT_MESSAGES: (eventId: number) => `${API_BASE_URL}/events/${eventId}/chat/messages`,
    CHAT_WEBSOCKET: (eventId: number, token: string) => `${API_BASE_URL.replace(/^http/, "ws")}/events/${eventId}/chat/ws?token=${encodeURIComponent(token)}`,
    CHAT_STOMP_WS: (token: string) => `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`,
  },
  EXPENSES: {
    CREATE: `${API_BASE_URL}/expenses`,
    GET_BY_EVENT: (eventId: number) => `${API_BASE_URL}/expenses/event/${eventId}`,
    UPDATE: (expenseId: number) => `${API_BASE_URL}/expenses/${expenseId}`,
    DELETE: (expenseId: number) => `${API_BASE_URL}/expenses/${expenseId}`,
    BALANCE: (eventId: number) => `${API_BASE_URL}/expenses/event/${eventId}/balance`,
  },
  USERS: {
    SEARCH: `${API_BASE_URL}/users/search`,
  },
  FRIENDS: {
    LIST: `${API_BASE_URL}/friends`,
    REQUEST: (friendId: number) => `${API_BASE_URL}/friends/request/${friendId}`,
    PENDING: `${API_BASE_URL}/friends/requests/pending`,
    SENT: `${API_BASE_URL}/friends/requests/sent`,
    ACCEPT: (friendshipId: number) => `${API_BASE_URL}/friends/${friendshipId}/accept`,
    REJECT: (friendshipId: number) => `${API_BASE_URL}/friends/${friendshipId}/reject`,
    DELETE: (friendshipId: number) => `${API_BASE_URL}/friends/${friendshipId}`,
  },
};

