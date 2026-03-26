import { api } from "@/lib/axios"
import type {
  CreateNoteRequest,
  CreateStudentRequest,
  GenerateInviteLinkRequest,
  GenerateInviteLinkResponse,
  InviteStudentRequest,
  ListStudentsParams,
  PaginatedStudents,
  StudentDetail,
  StudentItem,
  StudentNoteItem,
  UpdateNoteRequest,
  UpdateStudentRequest,
  UpdateStudentStatusRequest,
} from "@/features/students/types/students.types"

export const studentsService = {
  list: async (params?: ListStudentsParams): Promise<PaginatedStudents> =>
    (await api.get<PaginatedStudents>("/students", { params })).data,

  getById: async (id: string): Promise<StudentDetail> =>
    (await api.get<StudentDetail>(`/students/${id}`)).data,

  create: async (data: CreateStudentRequest): Promise<StudentItem> =>
    (await api.post<StudentItem>("/students", data)).data,

  update: async (id: string, data: UpdateStudentRequest): Promise<StudentItem> =>
    (await api.put<StudentItem>(`/students/${id}`, data)).data,

  updateStatus: async (id: string, data: UpdateStudentStatusRequest): Promise<void> => {
    await api.patch(`/students/${id}/status`, data)
  },

  invite: async (data: InviteStudentRequest): Promise<void> => {
    await api.post("/students/invite", data)
  },

  generateInviteLink: async (
    data: GenerateInviteLinkRequest
  ): Promise<GenerateInviteLinkResponse> =>
    (await api.post<GenerateInviteLinkResponse>("/students/invite-link", data)).data,

  sendAccessEmail: async (studentId: string): Promise<void> => {
    await api.post(`/students/${studentId}/send-access`, { mode: "email" })
  },

  generateAccessLink: async (studentId: string): Promise<{ accessLink: string }> =>
    (await api.post<{ accessLink: string }>(`/students/${studentId}/send-access`, { mode: "link" })).data,

  acceptInvite: async (data: { token: string; name: string; password: string }): Promise<void> => {
    await api.post("/students/accept-invite", data)
  },
}

export const notesService = {
  list: async (studentId: string): Promise<StudentNoteItem[]> =>
    (await api.get<StudentNoteItem[]>(`/students/${studentId}/notes`)).data,

  create: async (studentId: string, data: CreateNoteRequest): Promise<StudentNoteItem> =>
    (await api.post<StudentNoteItem>(`/students/${studentId}/notes`, data)).data,

  update: async (id: string, data: UpdateNoteRequest): Promise<StudentNoteItem> =>
    (await api.put<StudentNoteItem>(`/notes/${id}`, data)).data,

  remove: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`)
  },
}
