"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { SkipTrainingRequest } from "@/features/scheduling/types/scheduling.types"

interface UseSkipTrainingOptions {
  onSuccess?: () => void
}

export function useSkipTraining({ onSuccess }: UseSkipTrainingOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: SkipTrainingRequest }) =>
      schedulingService.skipTrainingOccurrence(scheduleId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      toast.success("Treino pulado com sucesso!")
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
