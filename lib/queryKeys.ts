export const queryKeys = {
  friends: {
    all: ["friends"] as const,
    list: ["friends", "list"] as const,
    requests: ["friends", "requests"] as const,
    pending: ["friends", "pending"] as const,
    sent: ["friends", "sent"] as const,
    status: (userId: number) => ["friends", "status", userId] as const,
  },
  users: {
    all: ["users"] as const,
    search: (query: string) => ["users", "search", query] as const,
    participantSearch: (query: string, excludeIds: number[]) =>
      ["users", "participant-search", query, excludeIds.join(",")] as const,
  },
  events: {
    all: ["events"] as const,
    active: ["events", "active"] as const,
    detail: (id: number) => ["events", "detail", id] as const,
    me: ["events", "me"] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    byEvent: (eventId: number) => ["expenses", "event", eventId] as const,
    balance: (eventId: number) => ["expenses", "balance", eventId] as const,
  },
  chat: {
    messages: (eventId: number) => ["chat", "messages", eventId] as const,
  },
  auth: {
    me: ["auth", "me"] as const,
  },
} as const;
