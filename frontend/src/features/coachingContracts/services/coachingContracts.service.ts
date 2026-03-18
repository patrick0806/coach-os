import { api } from "@/lib/axios"
import type {
  CoachingContractItem,
  CreateContractRequest,
} from "@/features/coachingContracts/types/coachingContracts.types"

export const coachingContractsService = {
  list: async (studentId: string): Promise<CoachingContractItem[]> =>
    (await api.get<CoachingContractItem[]>(`/students/${studentId}/contracts`)).data,

  create: async (studentId: string, data: CreateContractRequest): Promise<CoachingContractItem> =>
    (await api.post<CoachingContractItem>(`/students/${studentId}/contracts`, data)).data,

  cancel: async (id: string): Promise<CoachingContractItem> =>
    (await api.patch<CoachingContractItem>(`/coaching-contracts/${id}/cancel`)).data,
}
