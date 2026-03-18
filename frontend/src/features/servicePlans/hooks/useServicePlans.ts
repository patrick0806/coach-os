"use client"

import { useQuery } from "@tanstack/react-query"

import { servicePlansService } from "@/features/servicePlans/services/servicePlans.service"

export function useServicePlans() {
  return useQuery({
    queryKey: ["service-plans"],
    queryFn: () => servicePlansService.list(),
  })
}
