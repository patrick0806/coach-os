"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { UpdateAvailabilityRuleRequest } from "@/features/scheduling/types/scheduling.types"

interface UseUpdateAvailabilityRuleOptions {
  onOpenChange?: (open: boolean) => void
}

export function useUpdateAvailabilityRule({
  onOpenChange,
}: UseUpdateAvailabilityRuleOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAvailabilityRuleRequest }) =>
      schedulingService.updateAvailabilityRule(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability-rules"] })
      toast.success("Horário atualizado com sucesso!")
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
