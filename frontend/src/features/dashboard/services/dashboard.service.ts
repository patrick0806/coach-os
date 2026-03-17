import { api } from "@/lib/axios"

export interface DashboardStats {
  activeStudents: number
  totalStudents: number
  programTemplates: number
  activeStudentPrograms: number
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> =>
    (await api.get<DashboardStats>("/dashboard/stats")).data,
}
