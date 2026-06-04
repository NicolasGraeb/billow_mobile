import { authApi } from "@/api/auth";
import UserRegister from "@/types/UserRegister";
import { useMutation } from "@tanstack/react-query";

type RegisterPayload = UserRegister;

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });

  return {
    signUp: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
};
