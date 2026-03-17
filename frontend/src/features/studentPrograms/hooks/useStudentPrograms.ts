"use client"

import { useQuery } from "@tanstack/react-query"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { ListStudentProgramsParams } from "@/features/studentPrograms/types/studentPrograms.types"

export function useStudentPrograms(studentId: string, params?: ListStudentProgramsParams) {
  return useQuery({
    queryKey: ["student-programs", studentId, params],
    queryFn: () => studentProgramsService.list(studentId, params),
    enabled: !!studentId,
  })
}
