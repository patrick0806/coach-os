"use client"

import { useMutation } from "@tanstack/react-query"
import { workoutExecutionService } from "@/features/workoutExecution/services/workoutExecution.service"
import type { RecordSetRequest } from "@/features/workoutExecution/types/workoutExecution.types"

export function useRecordSet() {
  return useMutation({
    mutationFn: (data: RecordSetRequest) => workoutExecutionService.recordSet(data),
  })
}
