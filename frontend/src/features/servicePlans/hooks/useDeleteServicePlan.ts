"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { servicePlansService } from "@/features/servicePlans/services/servicePlans.service"

export function useDeleteServicePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => servicePlansService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["service-plans"] })
      toast.success("Plano removido com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
