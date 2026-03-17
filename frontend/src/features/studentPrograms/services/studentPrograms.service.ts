import { api } from "@/lib/axios"
import type {
  AssignProgramRequest,
  ListStudentProgramsParams,
  PaginatedStudentPrograms,
  StudentProgramDetail,
  StudentProgramItem,
  UpdateStudentExerciseRequest,
  UpdateStudentProgramStatusRequest,
  UpdateWorkoutDayRequest,
} from "@/features/studentPrograms/types/studentPrograms.types"

export const studentProgramsService = {
  list: async (
    studentId: string,
    params?: ListStudentProgramsParams
  ): Promise<PaginatedStudentPrograms> =>
    (
      await api.get<PaginatedStudentPrograms>(`/student-programs/students/${studentId}/programs`, { params })
    ).data,

  getById: async (id: string): Promise<StudentProgramDetail> =>
    (await api.get<StudentProgramDetail>(`/student-programs/${id}`)).data,

  assign: async (studentId: string, data: AssignProgramRequest): Promise<StudentProgramItem> =>
    (await api.post<StudentProgramItem>(`/student-programs/students/${studentId}/programs`, data)).data,

  updateStatus: async (
    id: string,
    data: UpdateStudentProgramStatusRequest
  ): Promise<StudentProgramItem> =>
    (await api.patch<StudentProgramItem>(`/student-programs/${id}/status`, data)).data,

  updateWorkoutDay: async (id: string, data: UpdateWorkoutDayRequest): Promise<void> => {
    await api.put(`/workout-days/${id}`, data)
  },

  updateStudentExercise: async (id: string, data: UpdateStudentExerciseRequest): Promise<void> => {
    await api.put(`/student-exercises/${id}`, data)
  },
}
