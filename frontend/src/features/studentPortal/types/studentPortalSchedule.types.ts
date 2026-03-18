export interface StudentTrainingSchedule {
  id: string
  tenantId: string
  studentId: string
  studentProgramId: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled"
export type AppointmentType = "online" | "presential"

export interface StudentAppointment {
  id: string
  tenantId: string
  studentId: string
  startAt: string
  endAt: string
  appointmentType: AppointmentType
  status: AppointmentStatus
  meetingUrl: string | null
  location: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  studentName: string
  studentEmail: string
}

export interface PaginatedStudentAppointments {
  content: StudentAppointment[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListMyAppointmentsParams {
  startDate?: string
  endDate?: string
  status?: AppointmentStatus
  page?: number
  size?: number
}
