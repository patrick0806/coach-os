import { api } from "@/lib/axios"
import type {
  CreateProgressRecordRequest,
  GetChartDataParams,
  ListProgressPhotosParams,
  ListProgressRecordsParams,
  ProgressChartDataPoint,
  ProgressPhoto,
  ProgressPhotosResponse,
  ProgressRecord,
  ProgressRecordsResponse,
  RequestPhotoUploadUrlResponse,
  UpdateProgressRecordRequest,
} from "@/features/progress/types/progress.types"

export const progressService = {
  listRecords: async (
    studentId: string,
    params?: ListProgressRecordsParams,
  ): Promise<ProgressRecordsResponse> =>
    (await api.get<ProgressRecordsResponse>(`/students/${studentId}/progress-records`, { params })).data,

  createRecord: async (
    studentId: string,
    data: CreateProgressRecordRequest,
  ): Promise<ProgressRecord> =>
    (await api.post<ProgressRecord>(`/students/${studentId}/progress-records`, data)).data,

  updateRecord: async (
    id: string,
    data: UpdateProgressRecordRequest,
  ): Promise<ProgressRecord> =>
    (await api.put<ProgressRecord>(`/progress-records/${id}`, data)).data,

  deleteRecord: async (id: string): Promise<void> => {
    await api.delete(`/progress-records/${id}`)
  },

  listPhotos: async (
    studentId: string,
    params?: ListProgressPhotosParams,
  ): Promise<ProgressPhotosResponse> =>
    (await api.get<ProgressPhotosResponse>(`/students/${studentId}/progress-photos`, { params })).data,

  requestPhotoUploadUrl: async (
    studentId: string,
    mimeType: string,
  ): Promise<RequestPhotoUploadUrlResponse> =>
    (
      await api.post<RequestPhotoUploadUrlResponse>(
        `/students/${studentId}/progress-photos/upload-url`,
        { mimeType },
      )
    ).data,

  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    })
  },

  savePhoto: async (
    studentId: string,
    mediaUrl: string,
    notes?: string,
  ): Promise<ProgressPhoto> =>
    (
      await api.post<ProgressPhoto>(`/students/${studentId}/progress-photos`, {
        mediaUrl,
        notes,
      })
    ).data,

  deletePhoto: async (id: string): Promise<void> => {
    await api.delete(`/progress-photos/${id}`)
  },

  getChartData: async (
    studentId: string,
    params?: GetChartDataParams,
  ): Promise<ProgressChartDataPoint[]> =>
    (await api.get<ProgressChartDataPoint[]>(
      `/students/${studentId}/progress-records/chart`,
      { params },
    )).data,
}
