"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { studentPortalCheckinsService } from "@/features/studentPortal/services/studentPortalCheckins.service"
import type { CreateCheckinRequest } from "@/features/progress/types/progressCheckins.types"

export function useCreateMyCheckin(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCheckinRequest) =>
      studentPortalCheckinsService.createMyCheckin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-portal", "my-checkins"] })
      toast.success("Evolução registrada com sucesso!")
      onSuccess?.()
    },
    onError: () => {
      toast.error("Erro ao registrar evolução. Tente novamente.")
    },
  })
}
