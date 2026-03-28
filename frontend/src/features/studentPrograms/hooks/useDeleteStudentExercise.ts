"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"

interface UseDeleteStudentExerciseOptions {
  programId: string
}

export function useDeleteStudentExercise({ programId }: UseDeleteStudentExerciseOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studentProgramsService.deleteStudentExercise(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
      toast.success("Exercício removido!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
