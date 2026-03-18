"use client"

import { useQuery } from "@tanstack/react-query"
import { studentPortalProgramsService } from "@/features/studentPortal/services/studentPortalPrograms.service"

export function useStudentActivePrograms() {
  return useQuery({
    queryKey: ["student-portal", "programs", "me"],
    queryFn: () => studentPortalProgramsService.listActivePrograms(),
  })
}
