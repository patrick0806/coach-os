"use client"

import { useQuery } from "@tanstack/react-query"

import { enumsService } from "@/features/shared/services/enums.service"

export function useEnumAttendanceTypes() {
  return useQuery({
    queryKey: ["enums", "attendance-types"],
    queryFn: () => enumsService.listAttendanceTypes(),
    staleTime: Infinity,
  })
}
