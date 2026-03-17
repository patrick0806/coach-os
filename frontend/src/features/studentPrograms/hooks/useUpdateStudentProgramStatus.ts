"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentProgramsService } from "@/features/studentPrograms/services/studentPrograms.service"
import type { UpdateStudentProgramStatusRequest } from "@/features/studentPrograms/types/studentPrograms.types"

interface UseUpdateStudentProgramStatusOptions {
  studentId: string
  onOpenChange?: (open: boolean) => void
}

export function useUpdateStudentProgramStatus({
  studentId,
  onOpenChange,
}: UseUpdateStudentProgramStatusOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentProgramStatusRequest }) =>
      studentProgramsService.updateStatus(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-programs", studentId] })
      await queryClient.invalidateQueries({ queryKey: ["student-programs"] })
      toast.success("Status atualizado com sucesso!")
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
