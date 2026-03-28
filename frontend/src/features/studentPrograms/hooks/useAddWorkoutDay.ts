"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { AddWorkoutDayRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseAddWorkoutDayOptions {
  programId: string
  onOpenChange?: (open: boolean) => void
}

export function useAddWorkoutDay({ programId, onOpenChange }: UseAddWorkoutDayOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddWorkoutDayRequest) =>
      studentProgramsService.addWorkoutDay(programId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
      toast.success("Dia de treino adicionado!")
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
