"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { notesService } from "@/features/students/services/students.service"
import type { UpdateNoteRequest } from "@/features/students/types/students.types"

export function useUpdateNote(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
      notesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", studentId, "notes"] })
      toast.success("Nota atualizada!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
