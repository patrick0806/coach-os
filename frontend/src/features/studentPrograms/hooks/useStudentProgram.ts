"use client"

import { useQuery } from "@tanstack/react-query"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"

export function useStudentProgram(id: string) {
  return useQuery({
    queryKey: ["student-programs", id],
    queryFn: () => studentProgramsService.getById(id),
    enabled: !!id,
  })
}
