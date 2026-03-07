import { api } from "@/lib/api";

export interface ServicePlan {
  id: string;
  personalId: string;
  name: string;
  description: string | null;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePlanPayload {
  name: string;
  description?: string;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
}

export interface UpdateServicePlanPayload {
  name?: string;
  description?: string;
  sessionsPerWeek?: number;
  durationMinutes?: number;
  price?: string;
  isActive?: boolean;
}

export function formatPrice(price: string): string {
  return parseFloat(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function listServicePlans(): Promise<ServicePlan[]> {
  const { data } = await api.get<ServicePlan[]>("/service-plans");
  return data;
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
