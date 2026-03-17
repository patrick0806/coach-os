"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"
import type { UpdateProgramTemplateRequest } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface UseUpdateProgramTemplateOptions {
  onOpenChange?: (open: boolean) => void
}

export function useUpdateProgramTemplate(
  id: string,
  { onOpenChange }: UseUpdateProgramTemplateOptions = {}
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProgramTemplateRequest) => trainingTemplatesService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates"] })
      toast.success("Programa atualizado com sucesso!")
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
