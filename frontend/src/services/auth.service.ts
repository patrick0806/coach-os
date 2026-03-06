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

export async function logout() {
  await api.post("/auth/logout");
}
