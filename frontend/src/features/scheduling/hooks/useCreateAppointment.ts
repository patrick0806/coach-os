"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  ConflictDetail,
  CreateAppointmentRequest,
} from "@/features/scheduling/types/scheduling.types"

interface UseCreateAppointmentOptions {
  onOpenChange?: (open: boolean) => void
  onConflicts?: (conflicts: ConflictDetail[], pendingData: CreateAppointmentRequest) => void
}

export function useCreateAppointment({
  onOpenChange,
  onConflicts,
}: UseCreateAppointmentOptions = {}) {
  const queryClient = useQueryClient()
  const [pendingConflictData, setPendingConflictData] =
    useState<CreateAppointmentRequest | null>(null)
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([])

  const mutation = useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      schedulingService.createAppointment(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Agendamento criado com sucesso!")
      onOpenChange?.(false)
      setPendingConflictData(null)
      setConflicts([])
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const responseConflicts: ConflictDetail[] =
          error.response.data?.conflicts ?? []
        if (responseConflicts.length > 0) {
          setConflicts(responseConflicts)
          return
        }
      }
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro inesperado")
        : "Erro inesperado"
      toast.error(message)
    },
  })

  function createWithConflictCheck(data: CreateAppointmentRequest) {
    setPendingConflictData(data)
    mutation.mutate(data)
  }

  function forceCreate() {
    if (!pendingConflictData) return
    mutation.mutate({ ...pendingConflictData, forceCreate: true })
  }

  function clearConflicts() {
    setConflicts([])
    setPendingConflictData(null)
  }

  return {
    ...mutation,
    createWithConflictCheck,
    forceCreate,
    conflicts,
    hasConflicts: conflicts.length > 0,
    clearConflicts,
    onConflicts,
  }
}
