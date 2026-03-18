"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { coachingContractsService } from "@/features/coachingContracts/services/coachingContracts.service"
import type { CreateContractRequest } from "@/features/coachingContracts/types/coachingContracts.types"

interface UseCreateContractOptions {
  studentId: string
  onOpenChange?: (open: boolean) => void
}

export function useCreateContract({ studentId, onOpenChange }: UseCreateContractOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractRequest) =>
      coachingContractsService.create(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-contracts", studentId] })
      toast.success("Plano vinculado com sucesso!")
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
