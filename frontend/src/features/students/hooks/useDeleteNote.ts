"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { notesService } from "@/features/students/services/students.service"

export function useDeleteNote(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", studentId, "notes"] })
      toast.success("Nota removida!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
