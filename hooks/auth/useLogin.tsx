import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/urls/api";

type LoginCredentials = {
  username: string;
  password: string;
};

export const useLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(
    async ({ username, password }: LoginCredentials) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim(),
          }),
        });

        if (!response.ok) {
          let message = `Login failed (${response.status})`;
          try {
            const errorData = await response.json();
            if (typeof errorData?.message === "string" && errorData.message.trim()) {
              message = errorData.message;
            }
          } catch {

          }
          throw new Error(message);
        }

        const data = await response.json();
        if (!data?.access_token || !data?.refresh_token) {
          throw new Error("Invalid login response: missing tokens");
        }

        await login(data.access_token, data.refresh_token);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected login error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  return { signIn, loading, error };
};