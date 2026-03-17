"use client"

import { ChevronDown, ChevronUp, Dumbbell, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import type { ExerciseTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface ExerciseTemplateItemProps {
  exerciseTemplate: ExerciseTemplateItem
  isFirst: boolean
  isLast: boolean
  isMutating: boolean
  onEdit: (exerciseTemplate: ExerciseTemplateItem) => void
  onDelete: (exerciseTemplate: ExerciseTemplateItem) => void
  onMoveUp: (exerciseTemplate: ExerciseTemplateItem) => void
  onMoveDown: (exerciseTemplate: ExerciseTemplateItem) => void
}

export function ExerciseTemplateItemRow({
  exerciseTemplate,
  isFirst,
  isLast,
  isMutating,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ExerciseTemplateItemProps) {
  const { exercise } = exerciseTemplate

  const metaParts: string[] = []
  if (exerciseTemplate.sets) metaParts.push(`${exerciseTemplate.sets} séries`)
  if (exerciseTemplate.repetitions) metaParts.push(`${exerciseTemplate.repetitions} reps`)
  if (exerciseTemplate.restSeconds) metaParts.push(`${exerciseTemplate.restSeconds}s descanso`)
  if (exerciseTemplate.duration) metaParts.push(exerciseTemplate.duration)

  return (
    <div
      className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
      data-testid="exercise-template-item"
    >
      <div className="flex shrink-0 flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-5"
          disabled={isFirst || isMutating}
          onClick={() => onMoveUp(exerciseTemplate)}
          data-testid="exercise-move-up"
        >
          <ChevronUp className="size-3" />
          <span className="sr-only">Mover para cima</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-5"
          disabled={isLast || isMutating}
          onClick={() => onMoveDown(exerciseTemplate)}
          data-testid="exercise-move-down"
        >
          <ChevronDown className="size-3" />
          <span className="sr-only">Mover para baixo</span>
        </Button>
      </div>

      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
        <Dumbbell className="size-3.5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{exercise.name}</p>
        {metaParts.length > 0 && (
          <p className="text-xs text-muted-foreground">{metaParts.join(" · ")}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => onEdit(exerciseTemplate)}
          data-testid="edit-exercise-template"
        >
          <Pencil className="size-3.5" />
          <span className="sr-only">Editar exercício</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(exerciseTemplate)}
          data-testid="delete-exercise-template"
        >
          <Trash2 className="size-3.5" />
          <span className="sr-only">Remover exercício</span>
        </Button>
      </div>
    </div>
  )
}
