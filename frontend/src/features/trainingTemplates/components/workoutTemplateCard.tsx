"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { EmptyState } from "@/shared/components/emptyState"
import { Dumbbell } from "lucide-react"
import { ExerciseTemplateItemRow } from "@/features/trainingTemplates/components/exerciseTemplateItem"
import { ExerciseTemplateFormDialog } from "@/features/trainingTemplates/components/exerciseTemplateFormDialog"
import { DeleteExerciseTemplateDialog } from "@/features/trainingTemplates/components/deleteExerciseTemplateDialog"
import { ExerciseSelectorDialog } from "@/features/trainingTemplates/components/exerciseSelectorDialog"
import { useReorderExerciseTemplates } from "@/features/trainingTemplates/hooks/useReorderExerciseTemplates"
import type {
  ExerciseTemplateItem,
  WorkoutTemplateItem,
} from "@/features/trainingTemplates/types/trainingTemplates.types"

interface WorkoutTemplateCardProps {
  workout: WorkoutTemplateItem
  templateId: string
  isExpanded: boolean
  isFirst: boolean
  isLast: boolean
  isMutatingOrder: boolean
  onToggle: () => void
  onEdit: (workout: WorkoutTemplateItem) => void
  onDelete: (workout: WorkoutTemplateItem) => void
  onMoveUp: (workout: WorkoutTemplateItem) => void
  onMoveDown: (workout: WorkoutTemplateItem) => void
}

export function WorkoutTemplateCard({
  workout,
  templateId,
  isExpanded,
  isFirst,
  isLast,
  isMutatingOrder,
  onToggle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: WorkoutTemplateCardProps) {
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)
  const [editExerciseTemplate, setEditExerciseTemplate] = useState<ExerciseTemplateItem | null>(
    null
  )
  const [deleteExerciseTemplate, setDeleteExerciseTemplate] =
    useState<ExerciseTemplateItem | null>(null)

  const reorderExercises = useReorderExerciseTemplates({ templateId })

  function handleMoveExerciseUp(exerciseTemplate: ExerciseTemplateItem) {
    const sorted = [...workout.exerciseTemplates].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((e) => e.id === exerciseTemplate.id)
    if (index <= 0) return
    const newOrder = [...sorted]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reorderExercises.mutate({ workoutId: workout.id, data: { ids: newOrder.map((e) => e.id) } })
  }

  function handleMoveExerciseDown(exerciseTemplate: ExerciseTemplateItem) {
    const sorted = [...workout.exerciseTemplates].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((e) => e.id === exerciseTemplate.id)
    if (index >= sorted.length - 1) return
    const newOrder = [...sorted]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    reorderExercises.mutate({ workoutId: workout.id, data: { ids: newOrder.map((e) => e.id) } })
  }

  const sortedExercises = [...workout.exerciseTemplates].sort((a, b) => a.order - b.order)
  const isMutatingExerciseOrder = reorderExercises.isPending

  return (
    <>
      <Card data-testid="workout-template-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 flex-col gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={isFirst || isMutatingOrder}
                onClick={() => onMoveUp(workout)}
                data-testid="workout-move-up"
              >
                <ChevronUp className="size-3.5" />
                <span className="sr-only">Mover para cima</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                disabled={isLast || isMutatingOrder}
                onClick={() => onMoveDown(workout)}
                data-testid="workout-move-down"
              >
                <ChevronDown className="size-3.5" />
                <span className="sr-only">Mover para baixo</span>
              </Button>
            </div>

            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={onToggle}
              data-testid="workout-toggle"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{workout.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ({workout.exerciseTemplates.length} exercício
                  {workout.exerciseTemplates.length !== 1 ? "s" : ""})
                </span>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onEdit(workout)}
                data-testid="edit-workout"
              >
                <Pencil className="size-3.5" />
                <span className="sr-only">Editar treino</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(workout)}
                data-testid="delete-workout"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Remover treino</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={onToggle}
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                <span className="sr-only">{isExpanded ? "Recolher" : "Expandir"}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0 space-y-2">
            {sortedExercises.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="Nenhum exercício"
                description="Adicione exercícios a este treino."
                className="py-6"
              />
            ) : (
              <div className="space-y-1.5">
                {sortedExercises.map((exerciseTemplate, index) => (
                  <ExerciseTemplateItemRow
                    key={exerciseTemplate.id}
                    exerciseTemplate={exerciseTemplate}
                    isFirst={index === 0}
                    isLast={index === sortedExercises.length - 1}
                    isMutating={isMutatingExerciseOrder}
                    onEdit={(et) => setEditExerciseTemplate(et)}
                    onDelete={(et) => setDeleteExerciseTemplate(et)}
                    onMoveUp={handleMoveExerciseUp}
                    onMoveDown={handleMoveExerciseDown}
                  />
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setAddExerciseOpen(true)}
              data-testid="add-exercise-button"
            >
              <Plus className="mr-2 size-3.5" />
              Adicionar exercício
            </Button>
          </CardContent>
        )}
      </Card>

      <ExerciseSelectorDialog
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        workoutId={workout.id}
        templateId={templateId}
      />

      <ExerciseTemplateFormDialog
        open={!!editExerciseTemplate}
        onOpenChange={(open) => !open && setEditExerciseTemplate(null)}
        exerciseTemplate={editExerciseTemplate}
        templateId={templateId}
      />

      <DeleteExerciseTemplateDialog
        exerciseTemplate={deleteExerciseTemplate}
        open={!!deleteExerciseTemplate}
        onOpenChange={(open) => !open && setDeleteExerciseTemplate(null)}
        templateId={templateId}
      />
    </>
  )
}
