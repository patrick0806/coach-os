"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

interface UseApproveAppointmentRequestOptions {
  onSuccess?: () => void
}

export function useApproveAppointmentRequest({
  onSuccess,
}: UseApproveAppointmentRequestOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, forceCreate }: { id: string; forceCreate?: boolean }) =>
      schedulingService.approveAppointmentRequest(id, { forceCreate }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointment-requests"] })
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Solicitação aprovada e agendamento criado!")
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
