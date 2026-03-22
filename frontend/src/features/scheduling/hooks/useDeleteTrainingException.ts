"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

interface UseDeleteTrainingExceptionOptions {
  onSuccess?: () => void
}

export function useDeleteTrainingException({ onSuccess }: UseDeleteTrainingExceptionOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exceptionId: string) =>
      schedulingService.deleteTrainingException(exceptionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      toast.success("Reagendamento desfeito com sucesso!")
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
