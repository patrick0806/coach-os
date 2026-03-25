"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalScheduleService } from "@/features/studentPortal/services/studentPortalSchedule.service"
import type { ListMyEventsParams } from "@/features/studentPortal/types/studentPortalSchedule.types"

export function useStudentMyEvents(params: ListMyEventsParams) {
  return useQuery({
    queryKey: ["student-portal", "my-events", params],
    queryFn: () => studentPortalScheduleService.listMyEvents(params),
  })
}
