"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressService } from "@/features/progress/services/progress.service"
import type { CreateProgressRecordRequest } from "@/features/progress/types/progress.types"

export function useCreateProgressRecord(studentId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProgressRecordRequest) =>
      progressService.createRecord(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-records", studentId] })
      toast.success("Registro adicionado com sucesso!")
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao adicionar registro")
        : "Erro ao adicionar registro"
      toast.error(message)
    },
  })
}
