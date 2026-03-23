import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import type {
  CreateTrainingScheduleRequest,
  UpdateTrainingScheduleRequest,
} from "@/features/scheduling/types/scheduling.types"

export function useTrainingSchedules(studentId: string) {
  return useQuery({
    queryKey: ["training-schedules", studentId],
    queryFn: () => schedulingService.listTrainingSchedules(studentId),
    enabled: !!studentId,
  })
}

export function useCreateTrainingSchedule(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTrainingScheduleRequest) =>
      schedulingService.createTrainingSchedule(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-schedules", studentId] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
    },
  })
}

export function useUpdateTrainingSchedule(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrainingScheduleRequest }) =>
      schedulingService.updateTrainingSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-schedules", studentId] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
    },
  })
}

export function useDeleteTrainingSchedule(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => schedulingService.deleteTrainingSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-schedules", studentId] })
      queryClient.invalidateQueries({ queryKey: ["calendar"] })
    },
  })
}
