import { api } from "@/lib/api";

export type UserRole = "PERSONAL" | "STUDENT" | "ADMIN";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile: {
    id: string;
    slug: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: UserRole;
  personalSlug: string | null;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<RegisterResponse>("/auth/register", payload);
  return response.data;
}

export async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function refreshSession(): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/refresh");
  return response.data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function forgotPassword(email: string) {
  const response = await api.post<{ message: string }>("/auth/forgot-password", { email });
  return response.data;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await api.post<{ message: string }>("/auth/reset-password", payload);
  return response.data;
}
