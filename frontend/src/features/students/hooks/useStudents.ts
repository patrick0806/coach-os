"use client"

import { useQuery } from "@tanstack/react-query"

import { studentsService } from "@/features/students/services/students.service"
import type { ListStudentsParams } from "@/features/students/types/students.types"

export function useStudents(params?: ListStudentsParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => studentsService.list(params),
  })
}
