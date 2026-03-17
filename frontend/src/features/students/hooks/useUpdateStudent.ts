"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentsService } from "@/features/students/services/students.service"
import type { UpdateStudentRequest } from "@/features/students/types/students.types"

interface UseUpdateStudentOptions {
  onOpenChange?: (open: boolean) => void
}

export function useUpdateStudent(id: string, { onOpenChange }: UseUpdateStudentOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateStudentRequest) => studentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Aluno atualizado com sucesso!")
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
