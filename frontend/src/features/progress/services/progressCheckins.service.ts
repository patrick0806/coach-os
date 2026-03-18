import { api } from "@/lib/axios"
import type {
  CheckinsResponse,
  CreateCheckinRequest,
  ListCheckinsParams,
  ProgressCheckin,
} from "@/features/progress/types/progressCheckins.types"

export const progressCheckinsService = {
  list: async (
    studentId: string,
    params?: ListCheckinsParams,
  ): Promise<CheckinsResponse> =>
    (
      await api.get<CheckinsResponse>(
        `/students/${studentId}/progress-checkins`,
        { params },
      )
    ).data,

  create: async (
    studentId: string,
    data: CreateCheckinRequest,
  ): Promise<ProgressCheckin> =>
    (
      await api.post<ProgressCheckin>(
        `/students/${studentId}/progress-checkins`,
        data,
      )
    ).data,

  getById: async (id: string): Promise<ProgressCheckin> =>
    (await api.get<ProgressCheckin>(`/progress-checkins/${id}`)).data,

  delete: async (id: string): Promise<void> => {
    await api.delete(`/progress-checkins/${id}`)
  },
}
