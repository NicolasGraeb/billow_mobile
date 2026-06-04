import { expensesApi } from "@/api/expenses";
import { invalidateExpenses } from "@/lib/invalidate";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import type { CreateExpensePayload } from "@/types/api";
import { useMutation } from "@tanstack/react-query";

export const useCreateExpense = (eventId: number) => {
  const { fetch } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => expensesApi.create(fetch, payload),
    onSuccess: () => invalidateExpenses(eventId),
  });

  return {
    createExpense: mutation.mutateAsync,
    creating: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
