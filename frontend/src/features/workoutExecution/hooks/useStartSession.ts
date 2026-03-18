"use client"

import { useMutation } from "@tanstack/react-query"
import { workoutExecutionService } from "@/features/workoutExecution/services/workoutExecution.service"
import type { StartSessionRequest } from "@/features/workoutExecution/types/workoutExecution.types"

export function useStartSession() {
  return useMutation({
    mutationFn: (data: StartSessionRequest) => workoutExecutionService.startSession(data),
  })
}
