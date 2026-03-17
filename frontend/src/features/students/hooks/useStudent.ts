"use client"

import { useQuery } from "@tanstack/react-query"

import { studentsService } from "@/features/students/services/students.service"

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => studentsService.getById(id),
    enabled: !!id,
  })
}
