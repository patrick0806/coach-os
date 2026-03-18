"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressService } from "@/features/progress/services/progress.service"
import type { UpdateProgressRecordRequest } from "@/features/progress/types/progress.types"

export function useUpdateProgressRecord(studentId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgressRecordRequest }) =>
      progressService.updateRecord(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-records", studentId] })
      toast.success("Registro atualizado com sucesso!")
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao atualizar registro")
        : "Erro ao atualizar registro"
      toast.error(message)
    },
  })
}
