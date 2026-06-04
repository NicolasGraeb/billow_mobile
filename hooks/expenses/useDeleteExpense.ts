import { expensesApi } from "@/api/expenses";
import { invalidateExpenses } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useMutation } from "@tanstack/react-query";

export const useDeleteExpense = (eventId: number) => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (expenseId: number) => expensesApi.delete(fetch, expenseId),
    onSuccess: () => invalidateExpenses(eventId),
  });

  return {
    deleteExpense: mutation.mutateAsync,
    deleting: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
