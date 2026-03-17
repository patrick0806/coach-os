"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"

interface UseDeleteExerciseTemplateOptions {
  templateId: string
}

export function useDeleteExerciseTemplate({ templateId }: UseDeleteExerciseTemplateOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exerciseTemplateId: string) =>
      trainingTemplatesService.removeExercise(exerciseTemplateId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
      toast.success("Exercício removido com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
