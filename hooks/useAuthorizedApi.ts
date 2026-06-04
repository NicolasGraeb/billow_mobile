import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export const useAuthorizedApi = () => {
  const { authorizedFetch, accessToken, userId, loading } = useAuth();
  return useMemo(
    () => ({
      fetch: authorizedFetch,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      userId,
      authLoading: loading,
    }),
    [authorizedFetch, accessToken, userId, loading]
  );
};
