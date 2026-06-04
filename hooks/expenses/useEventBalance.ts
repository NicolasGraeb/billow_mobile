import { expensesApi } from "@/api/expenses";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export const useEventBalance = (eventId: number, enabled = false) => {
  const { fetch } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.expenses.balance(eventId),
    queryFn: () => expensesApi.getBalance(fetch, eventId),
    enabled: enabled && eventId > 0,
  });

  return {
    balance: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
