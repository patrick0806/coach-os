"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { CreateAvailabilityRuleRequest } from "@/features/scheduling/types/scheduling.types"

interface UseCreateAvailabilityRuleOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateAvailabilityRule({
  onOpenChange,
}: UseCreateAvailabilityRuleOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAvailabilityRuleRequest) =>
      schedulingService.createAvailabilityRule(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability-rules"] })
      toast.success("Horário criado com sucesso!")
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
