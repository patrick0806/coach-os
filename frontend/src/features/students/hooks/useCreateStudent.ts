"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentsService } from "@/features/students/services/students.service"
import type { CreateStudentRequest } from "@/features/students/types/students.types"

interface UseCreateStudentOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateStudent({ onOpenChange }: UseCreateStudentOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStudentRequest) => studentsService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Aluno criado com sucesso!")
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
