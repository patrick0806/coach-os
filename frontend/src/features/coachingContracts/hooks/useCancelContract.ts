"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { coachingContractsService } from "@/features/coachingContracts/services/coachingContracts.service"

export function useCancelContract(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => coachingContractsService.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-contracts", studentId] })
      toast.success("Contrato cancelado com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
