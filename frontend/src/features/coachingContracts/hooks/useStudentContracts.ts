"use client"

import { useQuery } from "@tanstack/react-query"

import { coachingContractsService } from "@/features/coachingContracts/services/coachingContracts.service"

export function useStudentContracts(studentId: string) {
  return useQuery({
    queryKey: ["student-contracts", studentId],
    queryFn: () => coachingContractsService.list(studentId),
    enabled: !!studentId,
  })
}
