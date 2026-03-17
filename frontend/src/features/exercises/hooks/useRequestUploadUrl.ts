"use client"

import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { exercisesService } from "@/features/exercises/services/exercises.service"
import type { RequestUploadUrlRequest } from "@/features/exercises/types/exercises.types"

export function useRequestUploadUrl() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & RequestUploadUrlRequest) =>
      exercisesService.requestUploadUrl(id, data),
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao gerar URL de upload")
        : "Erro ao gerar URL de upload"
      toast.error(message)
    },
  })
}
