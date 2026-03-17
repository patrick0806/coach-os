"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { exercisesService } from "@/features/exercises/services/exercises.service"
import type { UpdateExerciseRequest } from "@/features/exercises/types/exercises.types"

interface UseUpdateExerciseOptions {
  onOpenChange?: (open: boolean) => void
}

export function useUpdateExercise(id: string, { onOpenChange }: UseUpdateExerciseOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateExerciseRequest) => exercisesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Exercício atualizado com sucesso!")
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
