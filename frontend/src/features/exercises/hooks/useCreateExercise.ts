"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { exercisesService } from "@/features/exercises/services/exercises.service"
import type { CreateExerciseRequest } from "@/features/exercises/types/exercises.types"

interface UseCreateExerciseOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateExercise({ onOpenChange }: UseCreateExerciseOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExerciseRequest) => exercisesService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["exercises"] })
      toast.success("Exercício criado com sucesso!")
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
