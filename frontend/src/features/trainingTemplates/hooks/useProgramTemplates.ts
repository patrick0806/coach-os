"use client"

import { useQuery } from "@tanstack/react-query"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { ListProgramTemplatesParams } from "@/features/trainingTemplates/types/trainingTemplates.types"

export function useProgramTemplates(params?: ListProgramTemplatesParams) {
  return useQuery({
    queryKey: ["program-templates", params],
    queryFn: () => trainingTemplatesService.list(params),
  })
}
