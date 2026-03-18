"use client"

import { useQuery } from "@tanstack/react-query"

import { progressService } from "@/features/progress/services/progress.service"
import type { ListProgressRecordsParams } from "@/features/progress/types/progress.types"

export function useProgressRecords(studentId: string, params?: ListProgressRecordsParams) {
  return useQuery({
    queryKey: ["progress-records", studentId, params],
    queryFn: () => progressService.listRecords(studentId, params),
    enabled: !!studentId,
  })
}
