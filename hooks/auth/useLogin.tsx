import { authApi, validateLoginResponse } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";

type LoginCredentials = {
  username: string;
  password: string;
};

export const useLogin = () => {
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ username, password }: LoginCredentials) => {
      const data = await authApi.login({ username, password });
      validateLoginResponse(data);
      console.log(data.access_token);
      await login(data.access_token, data.refresh_token);
      return data;
    },
  });

  return {
    signIn: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
