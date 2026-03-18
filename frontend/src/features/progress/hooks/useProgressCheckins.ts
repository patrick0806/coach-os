"use client"

import { useQuery } from "@tanstack/react-query"

import { progressCheckinsService } from "@/features/progress/services/progressCheckins.service"
import type { ListCheckinsParams } from "@/features/progress/types/progressCheckins.types"

export function useProgressCheckins(studentId: string, params?: ListCheckinsParams) {
  return useQuery({
    queryKey: ["progress-checkins", studentId, params],
    queryFn: () => progressCheckinsService.list(studentId, params),
    enabled: !!studentId,
  })
}
