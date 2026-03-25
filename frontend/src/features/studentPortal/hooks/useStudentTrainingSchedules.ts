"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalScheduleService } from "@/features/studentPortal/services/studentPortalSchedule.service"

export function useStudentMyRecurringSlots() {
  return useQuery({
    queryKey: ["student-portal", "my-recurring-slots"],
    queryFn: () => studentPortalScheduleService.listMyRecurringSlots(),
  })
}
