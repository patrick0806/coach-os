export type StudentStatus = "active" | "paused" | "archived"

export interface StudentItem {
  id: string
  userId: string
  tenantId: string
  status: StudentStatus
  name: string
  email: string
  phoneNumber: string | null
  goal: string | null
  observations: string | null
  physicalRestrictions: string | null
  createdAt: string | null
}

export type StudentDetail = StudentItem

export interface PaginatedStudents {
  content: StudentItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface CreateStudentRequest {
  name: string
  email: string
  phoneNumber?: string
  goal?: string
  observations?: string
  physicalRestrictions?: string
  servicePlanId?: string
}

export interface UpdateStudentRequest {
  phoneNumber?: string | null
  goal?: string | null
  observations?: string | null
  physicalRestrictions?: string | null
}

export interface UpdateStudentStatusRequest {
  status: StudentStatus
}

export interface InviteStudentRequest {
  name: string
  email: string
}

export interface GenerateInviteLinkRequest {
  name: string
  email: string
}

export interface GenerateInviteLinkResponse {
  inviteLink: string
}

export interface ListStudentsParams {
  page?: number
  size?: number
  search?: string
  status?: StudentStatus
}

export interface StudentNoteItem {
  id: string
  studentId: string
  tenantId: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface CreateNoteRequest {
  note: string
}

export interface UpdateNoteRequest {
  note: string
}
