import { api } from "@/lib/axios"
import type {
  CreateServicePlanRequest,
  ServicePlanItem,
  UpdateServicePlanRequest,
} from "@/features/servicePlans/types/servicePlans.types"

export const servicePlansService = {
  list: async (): Promise<ServicePlanItem[]> =>
    (await api.get<ServicePlanItem[]>("/service-plans")).data,

  getById: async (id: string): Promise<ServicePlanItem> =>
    (await api.get<ServicePlanItem>(`/service-plans/${id}`)).data,

  create: async (data: CreateServicePlanRequest): Promise<ServicePlanItem> =>
    (await api.post<ServicePlanItem>("/service-plans", data)).data,

  update: async (id: string, data: UpdateServicePlanRequest): Promise<ServicePlanItem> =>
    (await api.put<ServicePlanItem>(`/service-plans/${id}`, data)).data,

  remove: async (id: string): Promise<void> => {
    await api.delete(`/service-plans/${id}`)
  },
}
