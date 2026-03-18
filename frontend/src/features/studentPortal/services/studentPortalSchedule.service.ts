import { studentApi } from "@/lib/studentAxios"
import type {
  PaginatedStudentAppointments,
  StudentTrainingSchedule,
  ListMyAppointmentsParams,
} from "@/features/studentPortal/types/studentPortalSchedule.types"

export const studentPortalScheduleService = {
  listMyAppointments: async (
    params?: ListMyAppointmentsParams,
  ): Promise<PaginatedStudentAppointments> => {
    const response = await studentApi.get<PaginatedStudentAppointments>(
      "/me/appointments",
      { params },
    )
    return response.data
  },

  listMyTrainingSchedules: async (): Promise<StudentTrainingSchedule[]> => {
    const response = await studentApi.get<StudentTrainingSchedule[]>(
      "/me/training-schedules",
    )
    return response.data
  },
}
