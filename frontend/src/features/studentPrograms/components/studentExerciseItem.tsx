"use client"

import { Dumbbell, Pencil } from "lucide-react"

import { Button } from "@/shared/ui/button"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"

interface StudentExerciseItemProps {
  exercise: StudentExerciseItem
  onEdit: (exercise: StudentExerciseItem) => void
}

export function StudentExerciseItemRow({ exercise, onEdit }: StudentExerciseItemProps) {
  const metaParts: string[] = []
  if (exercise.sets) metaParts.push(`${exercise.sets} séries`)
  if (exercise.repetitions) metaParts.push(`${exercise.repetitions} reps`)
  if (exercise.restSeconds) metaParts.push(`${exercise.restSeconds}s descanso`)
  if (exercise.plannedWeight) metaParts.push(`${exercise.plannedWeight}kg`)
  if (exercise.duration) metaParts.push(exercise.duration)

  return (
    <div
      className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
      data-testid="student-exercise-item"
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Dumbbell className="size-3.5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{exercise.exercise.name}</p>
        {exercise.exercise.muscleGroup && (
          <p className="text-xs text-muted-foreground/70">{exercise.exercise.muscleGroup}</p>
        )}
        {metaParts.length > 0 && (
          <p className="text-xs text-muted-foreground">{metaParts.join(" · ")}</p>
        )}
        {exercise.notes && (
          <p className="text-xs text-muted-foreground/60 italic mt-0.5">{exercise.notes}</p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={() => onEdit(exercise)}
        data-testid="edit-student-exercise"
      >
        <Pencil className="size-3.5" />
        <span className="sr-only">Editar exercício</span>
      </Button>
    </div>
  )
}
