"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { UpdateExerciseTemplateRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseUpdateExerciseTemplateOptions {
  templateId: string
  onOpenChange?: (open: boolean) => void
}

export function useUpdateExerciseTemplate(
  exerciseTemplateId: string,
  { templateId, onOpenChange }: UseUpdateExerciseTemplateOptions
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateExerciseTemplateRequest) =>
      trainingTemplatesService.updateExercise(exerciseTemplateId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
      toast.success("Exercício atualizado com sucesso!")
      onOpenChange?.(false)
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
