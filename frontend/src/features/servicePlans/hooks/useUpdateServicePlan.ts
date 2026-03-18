"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { servicePlansService } from "@/features/servicePlans/services/servicePlans.service"
import type { UpdateServicePlanRequest } from "@/features/servicePlans/types/servicePlans.types"

interface UseUpdateServicePlanOptions {
  onOpenChange?: (open: boolean) => void
}

export function useUpdateServicePlan(id: string, { onOpenChange }: UseUpdateServicePlanOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateServicePlanRequest) => servicePlansService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["service-plans"] })
      toast.success("Plano atualizado com sucesso!")
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
