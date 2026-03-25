"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { CancelEventRequest } from "@/features/scheduling/types/scheduling.types"

interface UseCancelEventOptions {
  onSuccess?: () => void
}

export function useCancelEvent({ onSuccess }: UseCancelEventOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelEventRequest }) =>
      schedulingService.cancelEvent(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Evento cancelado.")
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
