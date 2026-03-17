"use client"

import { useQuery } from "@tanstack/react-query"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"

export function useProgramTemplate(id: string) {
  return useQuery({
    queryKey: ["program-templates", id],
    queryFn: () => trainingTemplatesService.getById(id),
    enabled: !!id,
  })
}
