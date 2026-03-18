"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressService } from "@/features/progress/services/progress.service"

export function useDeleteProgressRecord(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => progressService.deleteRecord(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-records", studentId] })
      toast.success("Registro removido com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao remover registro")
        : "Erro ao remover registro"
      toast.error(message)
    },
  })
}
