"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  ConflictDetail,
  CreateEventRequest,
} from "@/features/scheduling/types/scheduling.types"

interface UseCreateEventOptions {
  onOpenChange?: (open: boolean) => void
}

export function useCreateEvent({ onOpenChange }: UseCreateEventOptions = {}) {
  const queryClient = useQueryClient()
  const [pendingConflictData, setPendingConflictData] =
    useState<CreateEventRequest | null>(null)
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([])

  const mutation = useMutation({
    mutationFn: (data: CreateEventRequest) => schedulingService.createEvent(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["availability"] })
      toast.success("Evento criado com sucesso!")
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

  function createWithConflictCheck(data: CreateEventRequest) {
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
  }
}
