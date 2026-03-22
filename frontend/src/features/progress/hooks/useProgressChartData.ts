"use client"

import { useQuery } from "@tanstack/react-query"

import { progressService } from "@/features/progress/services/progress.service"
import type { MetricType } from "@/features/progress/types/progress.types"

export function useProgressChartData(
  studentId: string,
  metricType?: MetricType,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ["progress-chart", studentId, metricType ?? "all", startDate, endDate],
    queryFn: () =>
      progressService.getChartData(studentId, {
        metricType,
        startDate,
        endDate,
      }),
    enabled: !!studentId,
  })
}
