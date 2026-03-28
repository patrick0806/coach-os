"use client"

import { ChevronDown, ChevronUp, Dumbbell, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"

interface StudentExerciseItemProps {
  exercise: StudentExerciseItem
  isFirst: boolean
  isLast: boolean
  isMutating: boolean
  onEdit: (exercise: StudentExerciseItem) => void
  onDelete: (id: string) => void
  onMoveUp: (exercise: StudentExerciseItem) => void
  onMoveDown: (exercise: StudentExerciseItem) => void
}

export function StudentExerciseItemRow({
  exercise,
  isFirst,
  isLast,
  isMutating,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: StudentExerciseItemProps) {
  const metaParts: string[] = []
  if (exercise.sets) metaParts.push(`${exercise.sets} séries`)
  if (exercise.repetitions) metaParts.push(`${exercise.repetitions} reps`)
  if (exercise.restSeconds) metaParts.push(`${exercise.restSeconds}s descanso`)
  if (exercise.plannedWeight) metaParts.push(exercise.plannedWeight)
  if (exercise.duration) metaParts.push(exercise.duration)

  return (
    <div
      className="flex items-center gap-2 rounded-md border bg-card px-3 py-2"
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

      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isFirst || isMutating}
          onClick={() => onMoveUp(exercise)}
          data-testid="move-exercise-up"
        >
          <ChevronUp className="size-3.5" />
          <span className="sr-only">Mover para cima</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={isLast || isMutating}
          onClick={() => onMoveDown(exercise)}
          data-testid="move-exercise-down"
        >
          <ChevronDown className="size-3.5" />
          <span className="sr-only">Mover para baixo</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onEdit(exercise)}
          data-testid="edit-student-exercise"
        >
          <Pencil className="size-3.5" />
          <span className="sr-only">Editar exercício</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          disabled={isMutating}
          onClick={() => onDelete(exercise.id)}
          data-testid="delete-student-exercise"
        >
          <Trash2 className="size-3.5" />
          <span className="sr-only">Remover exercício</span>
        </Button>
      </div>
    </div>
  )
}
