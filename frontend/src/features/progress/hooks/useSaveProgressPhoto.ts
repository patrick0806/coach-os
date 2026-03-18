"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { progressService } from "@/features/progress/services/progress.service"

export function useSaveProgressPhoto(studentId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mediaUrl, notes }: { mediaUrl: string; notes?: string }) =>
      progressService.savePhoto(studentId, mediaUrl, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["progress-photos", studentId] })
      toast.success("Foto adicionada com sucesso!")
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao salvar foto")
        : "Erro ao salvar foto"
      toast.error(message)
    },
  })
}
