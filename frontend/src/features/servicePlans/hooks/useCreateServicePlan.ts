"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { servicePlansService } from "@/features/servicePlans/services/servicePlans.service"
import type { CreateServicePlanRequest } from "@/features/servicePlans/types/servicePlans.types"

interface UseCreateServicePlanOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateServicePlan({ onOpenChange }: UseCreateServicePlanOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateServicePlanRequest) => servicePlansService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["service-plans"] })
      toast.success("Plano criado com sucesso!")
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
