import { api } from "@/lib/axios"
import type {
  AddStudentExerciseRequest,
  AddWorkoutDayRequest,
  AssignProgramRequest,
  ListStudentProgramsParams,
  PaginatedStudentPrograms,
  ReorderItemsRequest,
  StudentExerciseItem,
  StudentProgramDetail,
  StudentProgramItem,
  UpdateStudentExerciseRequest,
  UpdateStudentProgramStatusRequest,
  UpdateWorkoutDayRequest,
  WorkoutDayItem,
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

  addWorkoutDay: async (programId: string, data: AddWorkoutDayRequest): Promise<WorkoutDayItem> =>
    (await api.post<WorkoutDayItem>(`/student-programs/${programId}/workout-days`, data)).data,

  deleteWorkoutDay: async (id: string): Promise<void> => {
    await api.delete(`/workout-days/${id}`)
  },

  reorderWorkoutDays: async (programId: string, data: ReorderItemsRequest): Promise<void> => {
    await api.patch(`/student-programs/${programId}/workout-days/reorder`, data)
  },

  addStudentExercise: async (workoutDayId: string, data: AddStudentExerciseRequest): Promise<StudentExerciseItem> =>
    (await api.post<StudentExerciseItem>(`/workout-days/${workoutDayId}/exercises`, data)).data,

  deleteStudentExercise: async (id: string): Promise<void> => {
    await api.delete(`/student-exercises/${id}`)
  },

  reorderStudentExercises: async (workoutDayId: string, data: ReorderItemsRequest): Promise<void> => {
    await api.patch(`/workout-days/${workoutDayId}/exercises/reorder`, data)
  },
}
