"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalScheduleService } from "@/features/studentPortal/services/studentPortalSchedule.service"
import type {
  ListMyEventsParams,
  ListMyCalendarParams,
} from "@/features/studentPortal/types/studentPortalSchedule.types"

export function useStudentMyEvents(params: ListMyEventsParams) {
  return useQuery({
    queryKey: ["student-portal", "my-events", params],
    queryFn: () => studentPortalScheduleService.listMyEvents(params),
  })
}

export function useStudentMyCalendar(params: ListMyCalendarParams) {
  return useQuery({
    queryKey: ["student-portal", "my-calendar", params],
    queryFn: () => studentPortalScheduleService.listMyCalendar(params),
  })
}
