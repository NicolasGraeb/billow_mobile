import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/urls/api";

export interface SearchUser {
  id: number;
  username: string;
  email: string;
}

const PAGE_SIZE = 20;

export const useSearchUsers = () => {
  const { authorizedFetch } = useAuth();
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string, pageToLoad = 0, append = false) => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length < 2) {
        setUsers([]);
        setPage(0);
        setHasMore(false);
        setError(null);
        return [] as SearchUser[];
      }

      setLoading(true);
      setError(null);

      try {
        const response = await authorizedFetch(
          `${API_ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(trimmedQuery)}&page=${pageToLoad}&size=${PAGE_SIZE}`
        );

        if (!response.ok) {
          throw new Error(`Nie udało się wyszukać użytkowników (${response.status})`);
        }

        const payload = await response.json();
        const incomingUsers: SearchUser[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
            ? payload.content
            : [];

        const mergedUsers = append ? [...users, ...incomingUsers] : incomingUsers;
        setUsers(mergedUsers);
        setPage(pageToLoad);

        if (typeof payload?.totalPages === "number") {
          setHasMore(pageToLoad + 1 < payload.totalPages);
        } else {
          setHasMore(incomingUsers.length === PAGE_SIZE);
        }

        return incomingUsers;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Błąd wyszukiwania użytkowników";
        setError(message);
        if (!append) {
          setUsers([]);
          setHasMore(false);
        }
        return [] as SearchUser[];
      } finally {
        setLoading(false);
      }
    },
    [authorizedFetch, users]
  );

  const loadMore = useCallback(
    async (query: string) => {
      if (loading || !hasMore) return [] as SearchUser[];
      return search(query, page + 1, true);
    },
    [hasMore, loading, page, search]
  );

  const clear = useCallback(() => {
    setUsers([]);
    setPage(0);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    users,
    loading,
    hasMore,
    error,
    search,
    loadMore,
    clear,
  };
};
