"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentsService } from "@/features/students/services/students.service"
import type { InviteStudentRequest } from "@/features/students/types/students.types"

interface UseInviteStudentOptions {
  onOpenChange?: (open: boolean) => void
}

export function useInviteStudent({ onOpenChange }: UseInviteStudentOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteStudentRequest) => studentsService.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Convite enviado com sucesso!")
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
