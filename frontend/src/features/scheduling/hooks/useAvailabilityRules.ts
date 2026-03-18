"use client"

import { useQuery } from "@tanstack/react-query"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

export function useAvailabilityRules() {
  return useQuery({
    queryKey: ["availability-rules"],
    queryFn: () => schedulingService.listAvailabilityRules(),
  })
}
