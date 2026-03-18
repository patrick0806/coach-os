"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

interface UseRejectAppointmentRequestOptions {
  onSuccess?: () => void
}

export function useRejectAppointmentRequest({
  onSuccess,
}: UseRejectAppointmentRequestOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.rejectAppointmentRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointment-requests"] })
      toast.success("Solicitação rejeitada.")
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
