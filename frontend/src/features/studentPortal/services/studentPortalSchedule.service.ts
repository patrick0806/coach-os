import { studentApi } from "@/lib/studentAxios"
import type {
  StudentCalendarEvent,
  StudentRecurringSlot,
  StudentUnifiedCalendarEntry,
  ListMyEventsParams,
  ListMyCalendarParams,
} from "@/features/studentPortal/types/studentPortalSchedule.types"

export const studentPortalScheduleService = {
  listMyEvents: async (params: ListMyEventsParams): Promise<StudentCalendarEvent[]> => {
    const response = await studentApi.get<StudentCalendarEvent[]>(
      "/me/events",
      { params },
    )
    return response.data
  },

  listMyRecurringSlots: async (): Promise<StudentRecurringSlot[]> => {
    const response = await studentApi.get<StudentRecurringSlot[]>(
      "/me/recurring-slots",
    )
    return response.data
  },

  listMyCalendar: async (params: ListMyCalendarParams): Promise<StudentUnifiedCalendarEntry[]> => {
    const response = await studentApi.get<StudentUnifiedCalendarEntry[]>(
      "/me/calendar",
      { params },
    )
    return response.data
  },
}
