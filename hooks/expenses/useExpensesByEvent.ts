import { expensesApi } from "@/api/expenses";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export const useExpensesByEvent = (eventId: number | null, enabled = true) => {
  const { fetch, authLoading } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.expenses.byEvent(eventId ?? 0),
    queryFn: () => expensesApi.getByEvent(fetch, eventId!),
    enabled: enabled && !authLoading && eventId != null && eventId > 0,
  });

  return {
    expenses: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
