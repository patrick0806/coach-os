"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalScheduleService } from "@/features/studentPortal/services/studentPortalSchedule.service"

export function useStudentTrainingSchedules() {
  return useQuery({
    queryKey: ["student-portal", "my-training-schedules"],
    queryFn: () => studentPortalScheduleService.listMyTrainingSchedules(),
  })
}
