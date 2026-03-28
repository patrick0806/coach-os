"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { ReorderItemsRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseReorderStudentExercisesOptions {
  programId: string
}

export function useReorderStudentExercises({ programId }: UseReorderStudentExercisesOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workoutDayId, data }: { workoutDayId: string; data: ReorderItemsRequest }) =>
      studentProgramsService.reorderStudentExercises(workoutDayId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", programId] })
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
