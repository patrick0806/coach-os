"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { AddStudentExerciseRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseAddStudentExerciseOptions {
  programId: string
  onOpenChange?: (open: boolean) => void
}

export function useAddStudentExercise({ programId, onOpenChange }: UseAddStudentExerciseOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workoutDayId, data }: { workoutDayId: string; data: AddStudentExerciseRequest }) =>
      studentProgramsService.addStudentExercise(workoutDayId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
      toast.success("Exercício adicionado!")
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
