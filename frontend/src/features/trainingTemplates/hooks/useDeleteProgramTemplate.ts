"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { trainingTemplatesService } from "@/features/trainingTemplates/services/trainingTemplates.service"

export function useDeleteProgramTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => trainingTemplatesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["program-templates"] })
      toast.success("Programa excluído com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
