"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalProgramsService } from "@/features/studentPortal/services/studentPortalPrograms.service"

export function useStudentProgramDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: ["student-portal", "program-detail", id],
    queryFn: () => studentPortalProgramsService.getProgramDetail(id!),
    enabled: !!id,
  })
}
