"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressCheckinsService } from "@/features/progress/services/progressCheckins.service"
import type { CreateCheckinRequest } from "@/features/progress/types/progressCheckins.types"

export function useCreateCheckin(studentId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCheckinRequest) =>
      progressCheckinsService.create(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-checkins", studentId] })
      toast.success("Evolução registrada com sucesso!")
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao registrar evolução")
        : "Erro ao registrar evolução"
      toast.error(message)
    },
  })
}
