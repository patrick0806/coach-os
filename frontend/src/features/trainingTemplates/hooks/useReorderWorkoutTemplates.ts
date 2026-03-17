"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { ReorderWorkoutTemplatesRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseReorderWorkoutTemplatesOptions {
  templateId: string
}

export function useReorderWorkoutTemplates({ templateId }: UseReorderWorkoutTemplatesOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReorderWorkoutTemplatesRequest) =>
      trainingTemplatesService.reorderWorkouts(templateId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
