import { api } from "@/lib/axios";
import type {
  AdminStats,
  AdminPlan,
  AdminTenantDetail,
  AdminAdmin,
  WhitelistedCoach,
  ListTenantsResponse,
} from "../types/admin.types";

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>("/admin/stats");
    return res.data;
  },

  async getPlans(): Promise<AdminPlan[]> {
    const res = await api.get<AdminPlan[]>("/admin/plans");
    return res.data;
  },

  async createPlan(data: {
    name: string;
    price: string;
    maxStudents: number;
    description?: string;
    highlighted?: boolean;
    order?: number;
    benefits?: string[];
  }): Promise<AdminPlan> {
    const res = await api.post<AdminPlan>("/admin/plans", data);
    return res.data;
  },

  async updatePlan(
    id: string,
    data: Partial<{
      name: string;
      price: string;
      maxStudents: number;
      description: string | null;
      highlighted: boolean;
      order: number;
      isActive: boolean;
    }>
  ): Promise<AdminPlan> {
    const res = await api.put<AdminPlan>(`/admin/plans/${id}`, data);
    return res.data;
  },

  async deletePlan(id: string): Promise<void> {
    await api.delete(`/admin/plans/${id}`);
  },

  async getWhitelist(): Promise<WhitelistedCoach[]> {
    const res = await api.get<WhitelistedCoach[]>("/admin/whitelist");
    return res.data;
  },

  async addToWhitelist(personalId: string): Promise<void> {
    await api.post(`/admin/whitelist/${personalId}`);
  },

  async removeFromWhitelist(personalId: string): Promise<void> {
    await api.delete(`/admin/whitelist/${personalId}`);
  },

  async getAdmins(): Promise<AdminAdmin[]> {
    const res = await api.get<AdminAdmin[]>("/admin/admins");
    return res.data;
  },

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AdminAdmin> {
    const res = await api.post<AdminAdmin>("/admin/admins", data);
    return res.data;
  },

  async deleteAdmin(id: string): Promise<void> {
    await api.delete(`/admin/admins/${id}`);
  },

  async getTenants(params: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<ListTenantsResponse> {
    const res = await api.get<ListTenantsResponse>("/admin/tenants", {
      params,
    });
    return res.data;
  },

  async getTenant(id: string): Promise<AdminTenantDetail> {
    const res = await api.get<AdminTenantDetail>(`/admin/tenants/${id}`);
    return res.data;
  },

  async updateTenantStatus(id: string, accessStatus: string): Promise<void> {
    await api.patch(`/admin/tenants/${id}/status`, { accessStatus });
  },
};
