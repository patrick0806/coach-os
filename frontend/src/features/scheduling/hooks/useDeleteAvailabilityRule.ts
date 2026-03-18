"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"

export function useDeleteAvailabilityRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteAvailabilityRule(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability-rules"] })
      toast.success("Horário removido.")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
