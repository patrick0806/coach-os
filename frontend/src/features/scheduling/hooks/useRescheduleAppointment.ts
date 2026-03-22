"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  ConflictDetail,
  RescheduleAppointmentRequest,
} from "@/features/scheduling/types/scheduling.types"

interface UseRescheduleAppointmentOptions {
  onSuccess?: () => void
}

export function useRescheduleAppointment({
  onSuccess,
}: UseRescheduleAppointmentOptions = {}) {
  const queryClient = useQueryClient()
  const [pendingData, setPendingData] =
    useState<{ id: string; data: RescheduleAppointmentRequest } | null>(null)
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([])

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RescheduleAppointmentRequest }) =>
      schedulingService.rescheduleAppointment(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["appointments"] })
      toast.success("Agendamento reagendado com sucesso!")
      setPendingData(null)
      setConflicts([])
      onSuccess?.()
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

  function rescheduleWithConflictCheck(id: string, data: RescheduleAppointmentRequest) {
    setPendingData({ id, data })
    mutation.mutate({ id, data })
  }

  function forceReschedule() {
    if (!pendingData) return
    mutation.mutate({
      id: pendingData.id,
      data: { ...pendingData.data, forceCreate: true },
    })
  }

  function clearConflicts() {
    setConflicts([])
    setPendingData(null)
  }

  return {
    ...mutation,
    rescheduleWithConflictCheck,
    forceReschedule,
    conflicts,
    hasConflicts: conflicts.length > 0,
    clearConflicts,
  }
}
