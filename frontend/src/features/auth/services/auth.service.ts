import { api } from "@/lib/axios";
import { authStore } from "@/stores/authStore";
import type { AuthTokensResponse } from "@/types/auth.types";
import type {
  LoginRequest,
  RegisterRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from "@/features/auth/types/auth.types";

export const authService = {
  async login(data: LoginRequest): Promise<AuthTokensResponse> {
    const response = await api.post<AuthTokensResponse>(
      "/auth/login",
      data
    );
    const payload = response.data;
    // Merge subscription into user so it persists in the auth cookie
    const userWithSubscription = { ...payload.user, subscription: payload.subscription ?? null };
    authStore.setAuth(payload.accessToken, userWithSubscription);
    return payload;
  },

  async register(data: RegisterRequest): Promise<AuthTokensResponse> {
    const response = await api.post<AuthTokensResponse>(
      "/auth/register",
      data
    );
    const payload = response.data;
    // Merge subscription into user so it persists in the auth cookie
    const userWithSubscription = { ...payload.user, subscription: payload.subscription ?? null };
    authStore.setAuth(payload.accessToken, userWithSubscription);
    return payload;
  },

  async requestPasswordReset(
    data: RequestPasswordResetRequest
  ): Promise<void> {
    await api.post("/auth/password-reset/request", data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post("/auth/password-reset/confirm", data);
  },

  async setupPassword(data: { token: string; password: string }): Promise<void> {
    await api.post("/auth/password-setup", data);
  },

  logout(): void {
    authStore.clear();
  },
};
