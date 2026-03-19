"use client"

import { useQuery } from "@tanstack/react-query"
import { subscriptionService } from "@/features/billing/services/subscription.service"

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionService.getCurrentSubscription(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
