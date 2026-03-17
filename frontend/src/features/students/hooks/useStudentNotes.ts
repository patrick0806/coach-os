"use client"

import { useQuery } from "@tanstack/react-query"

import { notesService } from "@/features/students/services/students.service"

export function useStudentNotes(studentId: string) {
  return useQuery({
    queryKey: ["students", studentId, "notes"],
    queryFn: () => notesService.list(studentId),
    enabled: !!studentId,
  })
}
