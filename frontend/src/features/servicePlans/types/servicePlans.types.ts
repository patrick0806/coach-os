export type AttendanceType = "online" | "presential"

export interface ServicePlanItem {
  id: string
  tenantId: string
  name: string
  description: string | null
  price: string // returned as string from backend
  sessionsPerWeek: number | null
  durationMinutes: number | null
  attendanceType: AttendanceType
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateServicePlanRequest {
  name: string
  description?: string
  price: number
  sessionsPerWeek?: number
  durationMinutes?: number
  attendanceType: AttendanceType
}

export interface UpdateServicePlanRequest {
  name?: string
  description?: string
  price?: number
  sessionsPerWeek?: number
  durationMinutes?: number
  attendanceType?: AttendanceType
  isActive?: boolean
}

export const ATTENDANCE_TYPES = [
  { value: "online" as AttendanceType, label: "Online" },
  { value: "presential" as AttendanceType, label: "Presencial" },
] as const
