"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

export function useAvailabilityExceptions(startDate?: Date, endDate?: Date) {
  const params =
    startDate && endDate
      ? {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        }
      : undefined

  return useQuery({
    queryKey: ["availability-exceptions", params],
    queryFn: () => schedulingService.listAvailabilityExceptions(params),
  })
}
