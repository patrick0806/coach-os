"use client"

import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { studentsService } from "@/features/students/services/students.service"

interface UseSendStudentAccessEmailOptions {
  onSuccess?: () => void
}

export function useSendStudentAccessEmail(
  studentId: string,
  options?: UseSendStudentAccessEmailOptions
) {
  return useMutation({
    mutationFn: () => studentsService.sendAccessEmail(studentId),
    onSuccess: () => {
      toast.success("Email enviado com sucesso!")
      options?.onSuccess?.()
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao enviar email")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}

export function useGenerateStudentAccessLink(studentId: string) {
  return useMutation({
    mutationFn: () => studentsService.generateAccessLink(studentId),
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao gerar link")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
