"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  CreateWorkingHoursRequest,
  UpdateWorkingHoursRequest,
} from "@/features/scheduling/types/scheduling.types"

export function useWorkingHours() {
  return useQuery({
    queryKey: ["working-hours"],
    queryFn: () => schedulingService.listWorkingHours(),
  })
}

export function useCreateWorkingHours() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkingHoursRequest) =>
      schedulingService.createWorkingHours(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Horario criado com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}

export function useUpdateWorkingHours() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkingHoursRequest }) =>
      schedulingService.updateWorkingHours(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Horario atualizado com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}

export function useDeleteWorkingHours() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteWorkingHours(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Horario removido.")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
