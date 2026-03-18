"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalScheduleService } from "@/features/studentPortal/services/studentPortalSchedule.service"
import type { ListMyAppointmentsParams } from "@/features/studentPortal/types/studentPortalSchedule.types"

export function useStudentMyAppointments(params?: ListMyAppointmentsParams) {
  return useQuery({
    queryKey: ["student-portal", "my-appointments", params],
    queryFn: () => studentPortalScheduleService.listMyAppointments(params),
  })
}
