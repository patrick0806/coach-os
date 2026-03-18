import { studentApi } from "@/lib/studentAxios"
import type {
  PaginatedStudentCheckins,
  StudentCheckin,
} from "@/features/studentPortal/types/studentPortalCheckins.types"
import type { CreateCheckinRequest } from "@/features/progress/types/progressCheckins.types"

export const studentPortalCheckinsService = {
  listMyCheckins: async (params?: {
    page?: number
    size?: number
  }): Promise<PaginatedStudentCheckins> => {
    const response = await studentApi.get<PaginatedStudentCheckins>(
      "/me/progress-checkins",
      { params },
    )
    return response.data
  },

  createMyCheckin: async (data: CreateCheckinRequest): Promise<StudentCheckin> => {
    const response = await studentApi.post<StudentCheckin>(
      "/me/progress-checkins",
      data,
    )
    return response.data
  },

  requestPhotoUploadUrl: async (
    mimeType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string }> => {
    const response = await studentApi.post<{ uploadUrl: string; fileUrl: string }>(
      "/me/progress-photos/upload-url",
      { mimeType },
    )
    return response.data
  },

  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })
  },
}
