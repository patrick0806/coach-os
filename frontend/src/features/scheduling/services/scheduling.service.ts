import { api, apiV2 } from "@/lib/axios"
import type {
  WorkingHoursItem,
  CreateWorkingHoursRequest,
  UpdateWorkingHoursRequest,
  RecurringSlotItem,
  CreateRecurringSlotRequest,
  UpdateRecurringSlotRequest,
  CalendarEventItem,
  CreateEventRequest,
  UpdateEventRequest,
  CancelEventRequest,
  UnifiedCalendarEntry,
  AvailabilitySlot,
  BulkCreateWorkingHoursResponse,
} from "@/features/scheduling/types/scheduling.types"

export const schedulingService = {
  // --- Calendar (V2) ---

  getCalendar: async (start: string, end: string): Promise<UnifiedCalendarEntry[]> =>
    (await apiV2.get<UnifiedCalendarEntry[]>("/calendar", { params: { start, end } })).data,

  getAvailability: async (start: string, end: string): Promise<AvailabilitySlot[]> =>
    (await apiV2.get<AvailabilitySlot[]>("/availability", { params: { start, end } })).data,

  // --- Working Hours ---

  listWorkingHours: async (): Promise<WorkingHoursItem[]> =>
    (await api.get<WorkingHoursItem[]>("/working-hours")).data,

  createWorkingHours: async (data: CreateWorkingHoursRequest): Promise<WorkingHoursItem> =>
    (await api.post<WorkingHoursItem>("/working-hours", data)).data,

  bulkCreateWorkingHours: async (
    items: CreateWorkingHoursRequest[],
  ): Promise<BulkCreateWorkingHoursResponse> =>
    (await api.post<BulkCreateWorkingHoursResponse>("/working-hours/bulk", { items })).data,

  updateWorkingHours: async (
    id: string,
    data: UpdateWorkingHoursRequest,
  ): Promise<WorkingHoursItem> =>
    (await api.patch<WorkingHoursItem>(`/working-hours/${id}`, data)).data,

  deleteWorkingHours: async (id: string): Promise<void> => {
    await api.delete(`/working-hours/${id}`)
  },

  // --- Recurring Slots ---

  listRecurringSlots: async (studentId?: string): Promise<RecurringSlotItem[]> =>
    (
      await api.get<RecurringSlotItem[]>("/recurring-slots", {
        params: studentId ? { studentId } : undefined,
      })
    ).data,

  createRecurringSlot: async (data: CreateRecurringSlotRequest): Promise<RecurringSlotItem> =>
    (await api.post<RecurringSlotItem>("/recurring-slots", data)).data,

  updateRecurringSlot: async (
    id: string,
    data: UpdateRecurringSlotRequest,
  ): Promise<RecurringSlotItem> =>
    (await api.patch<RecurringSlotItem>(`/recurring-slots/${id}`, data)).data,

  deleteRecurringSlot: async (id: string): Promise<void> => {
    await api.delete(`/recurring-slots/${id}`)
  },

  // --- Calendar Events ---

  createEvent: async (data: CreateEventRequest): Promise<CalendarEventItem> =>
    (await api.post<CalendarEventItem>("/events", data)).data,

  updateEvent: async (id: string, data: UpdateEventRequest): Promise<CalendarEventItem> =>
    (await api.patch<CalendarEventItem>(`/events/${id}`, data)).data,

  cancelEvent: async (id: string, data?: CancelEventRequest): Promise<void> => {
    await api.patch(`/events/${id}/cancel`, data ?? {})
  },

  completeEvent: async (id: string): Promise<void> => {
    await api.patch(`/events/${id}/complete`)
  },
}
