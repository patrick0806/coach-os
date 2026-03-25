import { studentApi } from "@/lib/studentAxios"
import type {
  StudentCalendarEvent,
  StudentRecurringSlot,
  ListMyEventsParams,
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
}
