"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"

interface UseDeleteWorkoutTemplateOptions {
  templateId: string
}

export function useDeleteWorkoutTemplate({ templateId }: UseDeleteWorkoutTemplateOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workoutId: string) => trainingTemplatesService.removeWorkout(workoutId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
      await queryClient.invalidateQueries({ queryKey: ["program-templates"] })
      toast.success("Treino removido com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
