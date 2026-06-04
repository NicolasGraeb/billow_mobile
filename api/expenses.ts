import type { AuthorizedFetch } from "@/api/client";
import { parseArray, requestJson } from "@/api/client";
import type {
  CreateExpensePayload,
  EventBalance,
  Expense,
  UpdateExpensePayload,
} from "@/types/api";
import { API_ENDPOINTS } from "@/urls/api";

export function normalizeBalancePayload(raw: unknown): EventBalance | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;

  const summary = d.summary;
  const mapSummary: Record<string, number> =
    summary && typeof summary === "object" && !Array.isArray(summary)
      ? Object.fromEntries(
          Object.entries(summary as Record<string, unknown>).map(([k, v]) => [
            k,
            typeof v === "number" ? v : Number(v),
          ])
        )
      : {};

  const balancesRaw = d.balances;
  const list = Array.isArray(balancesRaw) ? balancesRaw : [];

  const balances = list.map((entry: unknown) => {
    const e = entry as Record<string, unknown>;
    const fromUser = (e.from_user ?? e.fromUser) as EventBalance["balances"][0]["from_user"] | undefined;
    const toUser = (e.to_user ?? e.toUser) as EventBalance["balances"][0]["to_user"] | undefined;
    const amount = typeof e.amount === "number" ? e.amount : Number(e.amount ?? 0);
    return {
      from_user_id: Number(e.from_user_id ?? e.fromUserId ?? 0),
      to_user_id: Number(e.to_user_id ?? e.toUserId ?? 0),
      amount,
      from_user: fromUser ?? { id: 0, username: "?", email: "" },
      to_user: toUser ?? { id: 0, username: "?", email: "" },
    };
  });

  return {
    event_id: Number(d.event_id ?? d.eventId ?? 0),
    balances,
    summary: mapSummary,
  };
}

export const expensesApi = {
  getByEvent: async (fetchFn: AuthorizedFetch, eventId: number): Promise<Expense[]> => {
    const data = await requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EXPENSES.GET_BY_EVENT(eventId),
      { method: "GET" },
      "Nie udało się pobrać wydatków"
    );
    return parseArray<Expense>(data);
  },

  getBalance: async (fetchFn: AuthorizedFetch, eventId: number): Promise<EventBalance | null> => {
    const data = await requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EXPENSES.BALANCE(eventId),
      { method: "GET" },
      "Nie udało się pobrać podsumowania"
    );
    return normalizeBalancePayload(data);
  },

  create: (fetchFn: AuthorizedFetch, payload: CreateExpensePayload) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EXPENSES.CREATE,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      "Nie udało się utworzyć wydatku"
    ),

  update: (fetchFn: AuthorizedFetch, expenseId: number, payload: UpdateExpensePayload) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EXPENSES.UPDATE(expenseId),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      "Nie udało się zaktualizować wydatku"
    ),

  delete: (fetchFn: AuthorizedFetch, expenseId: number) =>
    requestJson<unknown>(
      fetchFn,
      API_ENDPOINTS.EXPENSES.DELETE(expenseId),
      { method: "DELETE" },
      "Nie udało się usunąć wydatku"
    ),
};
