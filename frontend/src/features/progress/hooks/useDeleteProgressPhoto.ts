"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressService } from "@/features/progress/services/progress.service"

export function useDeleteProgressPhoto(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => progressService.deletePhoto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-photos", studentId] })
      toast.success("Foto removida com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao remover foto")
        : "Erro ao remover foto"
      toast.error(message)
    },
  })
}
