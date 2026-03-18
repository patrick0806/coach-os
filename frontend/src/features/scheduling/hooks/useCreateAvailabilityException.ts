"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type { CreateAvailabilityExceptionRequest } from "@/features/scheduling/types/scheduling.types"

interface UseCreateAvailabilityExceptionOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateAvailabilityException({
  onOpenChange,
}: UseCreateAvailabilityExceptionOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAvailabilityExceptionRequest) =>
      schedulingService.createAvailabilityException(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["availability-exceptions"] })
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      toast.success("Data bloqueada com sucesso!")
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
