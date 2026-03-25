// --- Working Hours (replaces AvailabilityRule) ---

export interface WorkingHoursItem {
  id: string
  tenantId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateWorkingHoursRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
  effectiveFrom: string
}

export interface UpdateWorkingHoursRequest {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
}

export interface BulkCreateWorkingHoursResponse {
  created: WorkingHoursItem[]
  errors: { index: number; message: string }[]
}

// --- Recurring Slots (replaces TrainingSchedule) ---

export type RecurringSlotType = "booking" | "block"

export interface RecurringSlotItem {
  id: string
  tenantId: string
  studentId: string | null
  studentProgramId: string | null
  type: RecurringSlotType
  dayOfWeek: number
  startTime: string
  endTime: string
  effectiveFrom: string
  effectiveTo: string | null
  location: string | null
  isActive: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateRecurringSlotRequest {
  type: RecurringSlotType
  dayOfWeek: number
  startTime: string
  endTime: string
  effectiveFrom: string
  studentId?: string
  location?: string
}

export interface UpdateRecurringSlotRequest {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  location?: string | null
}

// --- Calendar Events (replaces Appointment + AvailabilityException + TrainingScheduleException) ---

export type CalendarEventType = "one_off" | "override" | "block"
export type CalendarEventStatus = "scheduled" | "cancelled" | "completed" | "no_show"
export type AppointmentType = "online" | "presential"

export interface CalendarEventItem {
  id: string
  tenantId: string
  studentId: string | null
  startAt: string
  endAt: string
  type: CalendarEventType
  status: CalendarEventStatus
  recurringSlotId: string | null
  originalStartAt: string | null
  appointmentType: AppointmentType | null
  meetingUrl: string | null
  location: string | null
  notes: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface CreateEventRequest {
  type: CalendarEventType
  startAt: string
  endAt: string
  studentId?: string
  recurringSlotId?: string
  originalStartAt?: string
  status?: CalendarEventStatus
  appointmentType?: AppointmentType
  meetingUrl?: string
  location?: string
  notes?: string
  forceCreate?: boolean
}

export interface UpdateEventRequest {
  startAt?: string
  endAt?: string
  appointmentType?: AppointmentType
  meetingUrl?: string
  location?: string
  notes?: string
  forceCreate?: boolean
}

export interface CancelEventRequest {
  cancellationReason?: string
}

// --- Unified Calendar Entry (from V2 calendar pipeline) ---

export type UnifiedCalendarEntryType = "booking" | "block" | "one_off" | "override"
export type UnifiedCalendarEntrySource = "recurring_slot" | "calendar_event"

export interface UnifiedCalendarEntry {
  id: string
  source: UnifiedCalendarEntrySource
  startAt: string
  endAt: string
  studentId?: string | null
  studentName?: string | null
  type: UnifiedCalendarEntryType
  status: CalendarEventStatus
  appointmentType?: AppointmentType | null
  meetingUrl?: string | null
  location?: string | null
  notes?: string | null
  recurringSlotId?: string | null
  isOverride?: boolean
}

// --- Availability (computed free slots) ---

export interface AvailabilitySlot {
  startAt: string
  endAt: string
}

// --- Conflict Detection ---

export interface ConflictDetail {
  type: "overlap" | "outside_working_hours"
  message: string
  details?: Record<string, unknown>
}

// --- Shared Constants ---

export const DAY_OF_WEEK_LABELS = [
  "Domingo",
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
] as const

export const DAY_OF_WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] as const
