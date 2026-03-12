import { api } from "@/lib/api";

export type AttendanceType = "online" | "presential" | "residential";

export interface ServicePlan {
  id: string;
  personalId: string;
  name: string;
  description: string | null;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
  attendanceType: AttendanceType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicServicePlan {
  id: string;
  name: string;
  description: string | null;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
}

interface PublicPersonalProfile {
  servicePlans: PublicServicePlan[];
}

export interface CreateServicePlanPayload {
  name: string;
  description?: string;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: number;
  attendanceType?: AttendanceType;
}

export interface UpdateServicePlanPayload {
  name?: string;
  description?: string;
  sessionsPerWeek?: number;
  durationMinutes?: number;
  price?: number;
  isActive?: boolean;
  attendanceType?: AttendanceType;
}

export function formatPrice(price: string): string {
  return parseFloat(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function listServicePlans(): Promise<ServicePlan[]> {
  const { data } = await api.get<ServicePlan[]>("/service-plans");
  return data;
}

export async function listPublicServicePlans(slug: string): Promise<PublicServicePlan[]> {
  const { data } = await api.get<PublicPersonalProfile>(`/personals/${slug}/public`);
  return data.servicePlans ?? [];
}

export async function createServicePlan(
  payload: CreateServicePlanPayload,
): Promise<ServicePlan> {
  const { data } = await api.post<ServicePlan>("/service-plans", payload);
  return data;
}

export async function updateServicePlan(
  id: string,
  payload: UpdateServicePlanPayload,
): Promise<ServicePlan> {
  const { data } = await api.patch<ServicePlan>(`/service-plans/${id}`, payload);
  return data;
}

export async function deactivateServicePlan(id: string): Promise<void> {
  await api.delete(`/service-plans/${id}`);
}
