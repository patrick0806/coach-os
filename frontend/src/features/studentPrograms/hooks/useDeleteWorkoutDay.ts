"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"

interface UseDeleteWorkoutDayOptions {
  programId: string
}

export function useDeleteWorkoutDay({ programId }: UseDeleteWorkoutDayOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studentProgramsService.deleteWorkoutDay(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
      toast.success("Dia de treino removido!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
