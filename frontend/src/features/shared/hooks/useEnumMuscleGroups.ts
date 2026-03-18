"use client"

import { useQuery } from "@tanstack/react-query"

import { enumsService } from "@/features/shared/services/enums.service"

export function useEnumMuscleGroups() {
  return useQuery({
    queryKey: ["enums", "muscle-groups"],
    queryFn: () => enumsService.listMuscleGroups(),
    staleTime: Infinity,
  })
}
