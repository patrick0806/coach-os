"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { UpdateWorkoutTemplateRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseUpdateWorkoutTemplateOptions {
  templateId: string
  onOpenChange?: (open: boolean) => void
}

export function useUpdateWorkoutTemplate(
  workoutId: string,
  { templateId, onOpenChange }: UseUpdateWorkoutTemplateOptions
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateWorkoutTemplateRequest) =>
      trainingTemplatesService.updateWorkout(workoutId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
      toast.success("Treino atualizado com sucesso!")
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
