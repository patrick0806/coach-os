"use client"

import { useMutation } from "@tanstack/react-query"
import { workoutExecutionService } from "@/features/workoutExecution/services/workoutExecution.service"
import type { CreateExecutionRequest } from "@/features/workoutExecution/types/workoutExecution.types"

export function useCreateExecution() {
  return useMutation({
    mutationFn: (data: CreateExecutionRequest) => workoutExecutionService.createExecution(data),
  })
}
