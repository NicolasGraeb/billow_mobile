import { PARTICIPANT_SEARCH_PAGE_SIZE, usersApi } from "@/api/users";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import type { UserSummary } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const MIN_QUERY_LENGTH = 2;

export const useParticipantSearch = (
  query: string,
  excludeParticipantIds: number[],
  enabled = true
) => {
  const { fetch } = useAuthorizedApi();
  const trimmed = query.trim();
  const excludeKey = useMemo(
    () => [...excludeParticipantIds].sort((a, b) => a - b),
    [excludeParticipantIds]
  );

  const result = useQuery({
    queryKey: queryKeys.users.participantSearch(trimmed, excludeKey),
    queryFn: async () => {
      const page = await usersApi.search(fetch, trimmed, 0, PARTICIPANT_SEARCH_PAGE_SIZE);
      const excludeSet = new Set(excludeKey);
      return page.items.filter((user: UserSummary) => !excludeSet.has(user.id));
    },
    enabled: enabled && trimmed.length >= MIN_QUERY_LENGTH,
  });

  return {
    users: result.data ?? [],
    loading: result.isLoading || result.isFetching,
    error: result.error instanceof Error ? result.error.message : null,
  };
};
