"use client"

import { useMutation } from "@tanstack/react-query"
import { workoutExecutionService } from "@/features/workoutExecution/services/workoutExecution.service"

export function useFinishSession() {
  return useMutation({
    mutationFn: (id: string) => workoutExecutionService.finishSession(id),
  })
}
