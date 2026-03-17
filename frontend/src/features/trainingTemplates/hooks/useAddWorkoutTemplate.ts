"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { AddWorkoutTemplateRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseAddWorkoutTemplateOptions {
  templateId: string
  onOpenChange?: (open: boolean) => void
}

export function useAddWorkoutTemplate({ templateId, onOpenChange }: UseAddWorkoutTemplateOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddWorkoutTemplateRequest) =>
      trainingTemplatesService.addWorkout(templateId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates", templateId] })
      await queryClient.invalidateQueries({ queryKey: ["program-templates"] })
      toast.success("Treino adicionado com sucesso!")
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
