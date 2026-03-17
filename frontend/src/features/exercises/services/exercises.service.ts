import { api } from "@/lib/axios"
import type {
  CreateExerciseRequest,
  ExerciseItem,
  ListExercisesParams,
  PaginatedExercises,
  RequestUploadUrlRequest,
  RequestUploadUrlResponse,
  UpdateExerciseRequest,
} from "@/features/exercises/types/exercises.types"

export const exercisesService = {
  list: async (params?: ListExercisesParams): Promise<PaginatedExercises> =>
    (await api.get<PaginatedExercises>("/exercises", { params })).data,

  getById: async (id: string): Promise<ExerciseItem> =>
    (await api.get<ExerciseItem>(`/exercises/${id}`)).data,

  create: async (data: CreateExerciseRequest): Promise<ExerciseItem> =>
    (await api.post<ExerciseItem>("/exercises", data)).data,

  update: async (id: string, data: UpdateExerciseRequest): Promise<ExerciseItem> =>
    (await api.put<ExerciseItem>(`/exercises/${id}`, data)).data,

  remove: async (id: string): Promise<void> => {
    await api.delete(`/exercises/${id}`)
  },

  requestUploadUrl: async (
    id: string,
    data: RequestUploadUrlRequest
  ): Promise<RequestUploadUrlResponse> =>
    (await api.post<RequestUploadUrlResponse>(`/exercises/${id}/upload-url`, data)).data,

  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })
  },
}
