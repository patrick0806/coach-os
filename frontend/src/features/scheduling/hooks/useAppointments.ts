"use client"

import { useQuery } from "@tanstack/react-query"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { ListAppointmentsParams } from "@/features/scheduling/types/scheduling.types"

export function useAppointments(params?: ListAppointmentsParams) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => schedulingService.listAppointments(params),
  })
}
