"use client"

import { useQuery } from "@tanstack/react-query"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { ListAppointmentRequestsParams } from "@/features/scheduling/types/scheduling.types"

export function useAppointmentRequests(params?: ListAppointmentRequestsParams) {
  return useQuery({
    queryKey: ["appointment-requests", params],
    queryFn: () => schedulingService.listAppointmentRequests(params),
  })
}
