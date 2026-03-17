"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { ReorderExerciseTemplatesRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseReorderExerciseTemplatesOptions {
  templateId: string
}

export function useReorderExerciseTemplates({ templateId }: UseReorderExerciseTemplatesOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workoutId, data }: { workoutId: string; data: ReorderExerciseTemplatesRequest }) =>
      trainingTemplatesService.reorderExercises(workoutId, data),
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
