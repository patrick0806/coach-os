"use client"

import { useQuery } from "@tanstack/react-query"

import { exercisesService } from "@/features/exercises/services/exercises.service"
import type { ListExercisesParams } from "@/features/exercises/types/exercises.types"

export function useExercises(params?: ListExercisesParams) {
  return useQuery({
    queryKey: ["exercises", params],
    queryFn: () => exercisesService.list(params),
  })
}
