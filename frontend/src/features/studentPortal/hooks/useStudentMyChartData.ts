"use client"

import { useQuery } from "@tanstack/react-query"

import { studentPortalCheckinsService } from "@/features/studentPortal/services/studentPortalCheckins.service"
import type { MetricType } from "@/features/progress/types/progress.types"

export function useStudentMyChartData(metricType?: MetricType) {
  return useQuery({
    queryKey: ["my-progress-chart", metricType ?? "all"],
    queryFn: () =>
      studentPortalCheckinsService.getMyChartData({ metricType }),
  })
}
