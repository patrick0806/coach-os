"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import axios from "axios"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  CreateRecurringSlotRequest,
  UpdateRecurringSlotRequest,
} from "@/features/scheduling/types/scheduling.types"

export function useRecurringSlots(studentId?: string) {
  return useQuery({
    queryKey: ["recurring-slots", studentId],
    queryFn: () => schedulingService.listRecurringSlots(studentId),
  })
}

export function useCreateRecurringSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecurringSlotRequest) =>
      schedulingService.createRecurringSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-slots"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Horario recorrente criado com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}

export function useUpdateRecurringSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringSlotRequest }) =>
      schedulingService.updateRecurringSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-slots"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Horario recorrente atualizado com sucesso!")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}

export function useDeleteRecurringSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteRecurringSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-slots"] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
      queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Horario recorrente removido.")
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })
}
