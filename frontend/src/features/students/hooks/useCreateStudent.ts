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
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        // Student limit reached — suggest upgrade
        if (data?.code === "student_limit_reached" || error.response?.status === 403) {
          toast.error("Limite de alunos atingido. Faça upgrade do seu plano para adicionar mais alunos.", {
            action: { label: "Ver planos", onClick: () => { window.location.href = "/assinatura" } },
          })
          return
        }
        toast.error(data?.message ?? "Erro inesperado")
      } else {
        toast.error("Erro inesperado")
      }
    },
  })
}
