export interface CalendarEntry {
  type: "appointment" | "training_schedule" | "exception"
  date: string
  startTime?: string
  endTime?: string
  studentId?: string
  studentName?: string
  appointmentType?: "online" | "presential"
  status?: "scheduled" | "completed" | "cancelled"
  location?: string
  meetingUrl?: string
  reason?: string
  sourceId: string
  isRescheduled?: boolean
  exceptionId?: string
}

export interface AppointmentItem {
  id: string
  studentId: string
  studentName: string
  startAt: string
  endAt: string
  type: "online" | "presential"
  status: "scheduled" | "completed" | "cancelled"
  location?: string | null
  meetingUrl?: string | null
  notes?: string | null
  tenantId: string
  createdAt: string
}

export interface PaginatedAppointments {
  content: AppointmentItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListAppointmentsParams {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  status?: string
  studentId?: string
}

export interface CreateAppointmentRequest {
  studentId: string
  startAt: string
  endAt: string
  appointmentType: "online" | "presential"
  meetingUrl?: string
  location?: string
  notes?: string
  forceCreate?: boolean
}

export interface ConflictDetail {
  type: "appointment" | "training_schedule" | "outside_availability" | "exception"
  message: string
  details?: Record<string, unknown>
}

export interface CreateAppointmentResponse {
  id: string
  conflicts?: ConflictDetail[]
}

export interface AppointmentRequestItem {
  id: string
  studentId: string
  studentName: string
  requestedStartAt: string
  requestedEndAt: string
  type: "online" | "presential"
  status: "pending" | "approved" | "rejected"
  notes?: string | null
  tenantId: string
  createdAt: string
}

export interface PaginatedAppointmentRequests {
  content: AppointmentRequestItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ListAppointmentRequestsParams {
  page?: number
  size?: number
  status?: string
}

export interface RescheduleAppointmentRequest {
  startAt: string
  endAt: string
  appointmentType?: "online" | "presential"
  meetingUrl?: string | null
  location?: string | null
  notes?: string | null
  forceCreate?: boolean
}

export interface ApproveAppointmentRequestRequest {
  forceCreate?: boolean
}

export interface AvailabilityRuleItem {
  id: string
  tenantId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
}

export interface CreateAvailabilityRuleRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface BulkCreateAvailabilityRulesRequest {
  rules: CreateAvailabilityRuleRequest[]
}

export interface BulkCreateAvailabilityRulesResponse {
  created: AvailabilityRuleItem[]
  conflicts: number
}

export interface UpdateAvailabilityRuleRequest {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  isActive?: boolean
}

export interface AvailabilityExceptionItem {
  id: string
  tenantId: string
  date: string
  reason?: string | null
  createdAt: string
}

export interface ListAvailabilityExceptionsParams {
  startDate?: string
  endDate?: string
}

export interface CreateAvailabilityExceptionRequest {
  date: string
  reason?: string
}

export const DAY_OF_WEEK_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const

export const DAY_OF_WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const

export interface TrainingScheduleItem {
  id: string
  tenantId: string
  studentId: string
  studentProgramId: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
  isActive: boolean | null
  createdAt: string
}

export interface CreateTrainingScheduleRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
  studentProgramId?: string
  location?: string
}

export interface UpdateTrainingScheduleRequest {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  location?: string | null
}

export interface RescheduleTrainingRequest {
  originalDate: string
  newDate: string
  newStartTime: string
  newEndTime: string
  newLocation?: string
  reason?: string
  forceCreate?: boolean
}

export interface SkipTrainingRequest {
  originalDate: string
  reason?: string
}

export interface TrainingScheduleExceptionItem {
  id: string
  tenantId: string
  trainingScheduleId: string
  originalDate: string
  action: "skip" | "reschedule"
  newDate?: string | null
  newStartTime?: string | null
  newEndTime?: string | null
  newLocation?: string | null
  reason?: string | null
  createdAt: string
}
