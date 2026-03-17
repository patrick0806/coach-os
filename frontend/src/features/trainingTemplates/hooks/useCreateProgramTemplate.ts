"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { CreateProgramTemplateRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseCreateProgramTemplateOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateProgramTemplate({ onOpenChange }: UseCreateProgramTemplateOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProgramTemplateRequest) => trainingTemplatesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates"] })
      toast.success("Programa criado com sucesso!")
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
