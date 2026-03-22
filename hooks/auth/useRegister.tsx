import {useCallback, useState} from "react";
import {API_ENDPOINTS} from "@/urls/api";
import UserRegister from "@/types/UserRegister";

type RegisterPayload = UserRegister;

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: payload.username.trim(),
          email: payload.email.trim(),
          password: payload.password.trim(),
          confirmPassword: payload.confirmPassword.trim(),
        }),
      });

      if (!response.ok) {
        let message = `Registration failed (${response.status})`;
        try {
          const errorData = await response.json();
          if (typeof errorData?.detail === "string" && errorData.detail.trim()) {
            message = errorData.detail;
          } else if (typeof errorData?.message === "string" && errorData.message.trim()) {
            message = errorData.message;
          }
        } catch {
        }
        throw new Error(message);
      }

      return await response.json().catch(() => ({}));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected registration error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signUp, loading, error };
};
