"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { UpdateStudentExerciseRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseUpdateStudentExerciseOptions {
  programId: string
  onOpenChange?: (open: boolean) => void
}

export function useUpdateStudentExercise({ programId, onOpenChange }: UseUpdateStudentExerciseOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentExerciseRequest }) =>
      studentProgramsService.updateStudentExercise(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
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
