import { expensesApi } from "@/api/expenses";
import { invalidateExpenses } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import type { UpdateExpensePayload } from "@/types/api";
import { useMutation } from "@tanstack/react-query";

export const useUpdateExpense = (eventId: number) => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: ({ expenseId, payload }: { expenseId: number; payload: UpdateExpensePayload }) =>
      expensesApi.update(fetch, expenseId, payload),
    onSuccess: () => invalidateExpenses(eventId),
  });

  return {
    updateExpense: mutation.mutateAsync,
    updating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
