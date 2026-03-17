"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { AddExerciseTemplateRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseAddExerciseTemplateOptions {
  templateId: string
  onOpenChange?: (open: boolean) => void
}

export function useAddExerciseTemplate({
  templateId,
  onOpenChange,
}: UseAddExerciseTemplateOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workoutId, data }: { workoutId: string; data: AddExerciseTemplateRequest }) =>
      trainingTemplatesService.addExercise(workoutId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
      toast.success("Exercício adicionado com sucesso!")
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
