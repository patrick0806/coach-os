"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressCheckinsService } from "@/features/progress/services/progressCheckins.service"

export function useDeleteCheckin(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => progressCheckinsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-checkins", studentId] })
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
