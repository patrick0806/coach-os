import type {
  CalendarEventStatus,
  AppointmentType,
  RecurringSlotType,
} from "@/features/scheduling/types/scheduling.types"

// --- Student Recurring Slot (from GET /v1/me/recurring-slots) ---

export interface StudentRecurringSlot {
  id: string
  tenantId: string
  studentId: string | null
  studentProgramId: string | null
  type: RecurringSlotType
  dayOfWeek: number
  startTime: string
  endTime: string
  location: string | null
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// --- Student Calendar Event (from GET /v1/me/events) ---

export interface StudentCalendarEvent {
  id: string
  tenantId: string
  studentId: string
  startAt: string
  endAt: string
  type: "one_off" | "override" | "block"
  recurringSlotId: string | null
  originalStartAt: string | null
  status: CalendarEventStatus
  appointmentType: AppointmentType | null
  meetingUrl: string | null
  location: string | null
  notes: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  studentName: string | null
  studentEmail: string | null
}

export interface ListMyEventsParams {
  startDate: string
  endDate: string
  status?: CalendarEventStatus
}

export interface ListMyCalendarParams {
  start: string
  end: string
}

export interface StudentUnifiedCalendarEntry {
  id: string
  source: "recurring_slot" | "calendar_event"
  startAt: string
  endAt: string
  studentId: string | null
  studentName: string | null
  type: "booking" | "block" | "one_off" | "override"
  status: "scheduled" | "cancelled" | "completed" | "no_show"
  appointmentType: string | null
  meetingUrl: string | null
  location: string | null
  notes: string | null
  recurringSlotId: string | null
  isOverride?: boolean
}
