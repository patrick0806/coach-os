"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { UpdateWorkoutDayRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseUpdateWorkoutDayOptions {
  programId: string
}

export function useUpdateWorkoutDay({ programId }: UseUpdateWorkoutDayOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkoutDayRequest }) =>
      studentProgramsService.updateWorkoutDay(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
      toast.success("Dia de treino atualizado!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
