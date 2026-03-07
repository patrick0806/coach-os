import { api } from "@/lib/api";

// ─── Personals ────────────────────────────────────────────────────────────────

export interface AdminPersonal {
  id: string;
  userId: string;
  name: string;
  email: string;
  slug: string;
  isActive: boolean;
  subscriptionPlanName: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

export interface AdminPersonalDetail extends AdminPersonal {
  bio: string | null;
  phoneNumber: string | null;
  stripeSubscriptionId: string | null;
  subscriptionExpiresAt: string | null;
}

export interface PaginatedPersonals {
  content: AdminPersonal[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function listAdminPersonals(params: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<PaginatedPersonals> {
  const { data } = await api.get<PaginatedPersonals>("/admin/personals", { params });
  return data;
}

export async function getAdminPersonal(id: string): Promise<AdminPersonalDetail> {
  const { data } = await api.get<AdminPersonalDetail>(`/admin/personals/${id}`);
  return data;
}

export async function togglePersonalStatus(
  id: string,
  isActive: boolean,
): Promise<AdminPersonal> {
  const { data } = await api.patch<AdminPersonal>(`/admin/personals/${id}/status`, { isActive });
  return data;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export interface AdminPlan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  benefits: string[];
  highlighted: boolean;
  isActive: boolean;
  order: number;
  maxStudents: number;
}

export interface CreateAdminPlanPayload {
  name: string;
  description?: string;
  price: string;
  benefits: string[];
  highlighted?: boolean;
  order?: number;
  maxStudents?: number;
}

export interface UpdateAdminPlanPayload {
  name?: string;
  description?: string;
  price?: string;
  benefits?: string[];
  highlighted?: boolean;
  maxStudents?: number;
}

export async function listAdminPlans(): Promise<AdminPlan[]> {
  const { data } = await api.get<AdminPlan[]>("/admin/plans");
  return data;
}

export async function createAdminPlan(payload: CreateAdminPlanPayload): Promise<AdminPlan> {
  const { data } = await api.post<AdminPlan>("/admin/plans", payload);
  return data;
}

export async function updateAdminPlan(
  id: string,
  payload: UpdateAdminPlanPayload,
): Promise<AdminPlan> {
  const { data } = await api.patch<AdminPlan>(`/admin/plans/${id}`, payload);
  return data;
}

export async function toggleAdminPlanStatus(
  id: string,
  isActive: boolean,
): Promise<AdminPlan> {
  const { data } = await api.patch<AdminPlan>(`/admin/plans/${id}/status`, { isActive });
  return data;
}

export async function reorderAdminPlans(
  items: { id: string; order: number }[],
): Promise<void> {
  await api.patch("/admin/plans/reorder", { items });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export type DashboardPeriod = "7d" | "30d" | "90d" | "all";

export interface DashboardStats {
  mrr: number;
  totalSubscribers: number;
  newSubscribers: number;
  churnRate: number;
  totalStudents: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface PlanDistributionPoint {
  planName: string;
  count: number;
}

export interface DashboardCharts {
  revenue: RevenuePoint[];
  planDistribution: PlanDistributionPoint[];
}

export async function getDashboardStats(period: DashboardPeriod): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/admin/dashboard/stats", {
    params: { period },
  });
  return data;
}

export async function getDashboardCharts(period: DashboardPeriod): Promise<DashboardCharts> {
  const { data } = await api.get<DashboardCharts>("/admin/dashboard/charts", {
    params: { period },
  });
  return data;
}
