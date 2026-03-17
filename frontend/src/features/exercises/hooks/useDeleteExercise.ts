"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { exercisesService } from "@/features/exercises/services/exercises.service"

export function useDeleteExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => exercisesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Exercício removido com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
