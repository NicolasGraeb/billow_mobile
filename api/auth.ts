import { publicRequestJson } from "@/api/client";
import type { LoginResponse, UserProfile } from "@/types/api";
import { API_ENDPOINTS } from "@/urls/api";
import type { AuthorizedFetch } from "@/api/client";
import { ensureOk, parseJson, requestJson } from "@/api/client";

type LoginBody = { username: string; password: string };
type RegisterBody = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const authApi = {
  login: (body: LoginBody) =>
    publicRequestJson<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: body.username.trim(),
          password: body.password.trim(),
        }),
      },
      "Login failed"
    ),

  register: (body: RegisterBody) =>
    publicRequestJson<unknown>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: body.username.trim(),
          email: body.email.trim(),
          password: body.password.trim(),
          confirmPassword: body.confirmPassword.trim(),
        }),
      },
      "Registration failed"
    ),

  getMe: (fetchFn: AuthorizedFetch) =>
    requestJson<UserProfile>(fetchFn, API_ENDPOINTS.AUTH.ME, { method: "GET" }, "Nie udało się pobrać profilu"),
};

export function validateLoginResponse(data: LoginResponse): void {
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error("Invalid login response: missing tokens");
  }
}
