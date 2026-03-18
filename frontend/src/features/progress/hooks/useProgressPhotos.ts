"use client"

import { useQuery } from "@tanstack/react-query"

import { progressService } from "@/features/progress/services/progress.service"
import type { ListProgressPhotosParams } from "@/features/progress/types/progress.types"

export function useProgressPhotos(studentId: string, params?: ListProgressPhotosParams) {
  return useQuery({
    queryKey: ["progress-photos", studentId, params],
    queryFn: () => progressService.listPhotos(studentId, params),
    enabled: !!studentId,
  })
}
