"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  ConflictDetail,
  UpdateEventRequest,
} from "@/features/scheduling/types/scheduling.types"

interface UseUpdateEventOptions {
  onSuccess?: () => void
}

export function useUpdateEvent({ onSuccess }: UseUpdateEventOptions = {}) {
  const queryClient = useQueryClient()
  const [pendingData, setPendingData] =
    useState<{ id: string; data: UpdateEventRequest } | null>(null)
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([])

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      schedulingService.updateEvent(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Evento atualizado com sucesso!")
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

  function updateWithConflictCheck(id: string, data: UpdateEventRequest) {
    setPendingData({ id, data })
    mutation.mutate({ id, data })
  }

  function forceUpdate() {
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
    updateWithConflictCheck,
    forceUpdate,
    conflicts,
    hasConflicts: conflicts.length > 0,
    clearConflicts,
  }
}
