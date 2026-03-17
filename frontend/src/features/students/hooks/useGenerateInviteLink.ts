"use client"

import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentsService } from "@/features/students/services/students.service"
import type { GenerateInviteLinkRequest } from "@/features/students/types/students.types"

export function useGenerateInviteLink() {
  return useMutation({
    mutationFn: (data: GenerateInviteLinkRequest) => studentsService.generateInviteLink(data),
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
