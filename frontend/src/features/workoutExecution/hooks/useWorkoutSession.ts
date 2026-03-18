"use client"

import { useQuery } from "@tanstack/react-query"
import { workoutExecutionService } from "@/features/workoutExecution/services/workoutExecution.service"

export function useWorkoutSession(id: string | null | undefined) {
  return useQuery({
    queryKey: ["workout-session", id],
    queryFn: () => workoutExecutionService.getSession(id!),
    enabled: !!id,
  })
}
