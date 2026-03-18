"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

export function useCalendar(startDate: Date, endDate: Date) {
  const start = format(startDate, "yyyy-MM-dd")
  const end = format(endDate, "yyyy-MM-dd")

  return useQuery({
    queryKey: ["calendar", start, end],
    queryFn: () => schedulingService.getCalendar(start, end),
  })
}
