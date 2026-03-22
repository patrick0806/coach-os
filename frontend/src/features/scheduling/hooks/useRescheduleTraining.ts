"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  ConflictDetail,
  RescheduleTrainingRequest,
} from "@/features/scheduling/types/scheduling.types"

interface UseRescheduleTrainingOptions {
  onSuccess?: () => void
}

export function useRescheduleTraining({
  onSuccess,
}: UseRescheduleTrainingOptions = {}) {
  const queryClient = useQueryClient()
  const [pendingData, setPendingData] =
    useState<{ scheduleId: string; data: RescheduleTrainingRequest } | null>(null)
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([])

  const mutation = useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: RescheduleTrainingRequest }) =>
      schedulingService.rescheduleTrainingOccurrence(scheduleId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      toast.success("Treino reagendado com sucesso!")
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

  function rescheduleWithConflictCheck(scheduleId: string, data: RescheduleTrainingRequest) {
    setPendingData({ scheduleId, data })
    mutation.mutate({ scheduleId, data })
  }

  function forceReschedule() {
    if (!pendingData) return
    mutation.mutate({
      scheduleId: pendingData.scheduleId,
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
