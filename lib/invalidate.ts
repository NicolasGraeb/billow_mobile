import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";

export const invalidateEvents = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.events.all });

export const invalidateEventDetail = (eventId: number) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) });

export const invalidateExpenses = (eventId: number) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.byEvent(eventId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.balance(eventId) });
};

export const invalidateFriends = () => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.friends.requests });
};

export const invalidateProfile = () =>
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
