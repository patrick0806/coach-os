"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { AssignProgramRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseAssignProgramOptions {
  studentId: string
  onOpenChange?: (open: boolean) => void
}

export function useAssignProgram({ studentId, onOpenChange }: UseAssignProgramOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignProgramRequest) => studentProgramsService.assign(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", studentId] })
      toast.success("Programa atribuído com sucesso!")
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
