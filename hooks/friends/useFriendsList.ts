import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/urls/api";

export interface FriendUser {
  id: number;
  username: string;
  email: string;
}

export interface FriendRelation {
  id: number;
  user_id: number;
  friend_id: number;
  status: string;
  user: FriendUser;
  friend: FriendUser;
}

export const useFriendsList = () => {
  const { authorizedFetch } = useAuth();
  const [friends, setFriends] = useState<FriendRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authorizedFetch(API_ENDPOINTS.FRIENDS.LIST);
      if (!response.ok) {
        throw new Error(`Nie udało się pobrać znajomych (${response.status})`);
      }

      const data = await response.json();
      const parsedFriends: FriendRelation[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.items)
            ? data.items
            : [];
      setFriends(parsedFriends);
      return parsedFriends;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Błąd pobierania znajomych";
      setError(message);
      setFriends([]);
      return [] as FriendRelation[];
    } finally {
      setLoading(false);
    }
  }, [authorizedFetch]);

  return {
    friends,
    loading,
    error,
    fetchFriends,
  };
};
