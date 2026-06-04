import { authApi } from "@/api/auth";
import { queryKeys } from "@/lib/queryKeys";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { useQuery } from "@tanstack/react-query";

export const useProfile = (enabled = true) => {
  const { fetch, isAuthenticated } = useAuthorizedApi();

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.getMe(fetch),
    enabled: enabled && isAuthenticated,
  });

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
