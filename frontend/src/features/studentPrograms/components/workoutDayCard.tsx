"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Dumbbell, Plus, Trash2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { EmptyState } from "@/shared/components/emptyState"
import { StudentExerciseItemRow } from "@/features/studentPrograms/components/studentExerciseItem"
import { UpdateStudentExerciseDialog } from "@/features/studentPrograms/components/updateStudentExerciseDialog"
import { AddStudentExerciseDialog } from "@/features/studentPrograms/components/addStudentExerciseDialog"
import { useDeleteStudentExercise } from "@/features/studentPrograms/hooks/useDeleteStudentExercise"
import { useReorderStudentExercises } from "@/features/studentPrograms/hooks/useReorderStudentExercises"
import type {
  StudentExerciseItem,
  WorkoutDayItem,
} from "@/features/studentPrograms/types/studentPrograms.types"

interface WorkoutDayCardProps {
  workoutDay: WorkoutDayItem
  programId: string
  isExpanded: boolean
  isFirst: boolean
  isLast: boolean
  isMutatingDays: boolean
  onToggle: () => void
  onDelete: (id: string) => void
  onMoveUp: (day: WorkoutDayItem) => void
  onMoveDown: (day: WorkoutDayItem) => void
}

export function WorkoutDayCard({
  workoutDay,
  programId,
  isExpanded,
  isFirst,
  isLast,
  isMutatingDays,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: WorkoutDayCardProps) {
  const [editExercise, setEditExercise] = useState<StudentExerciseItem | null>(null)
  const [addExerciseOpen, setAddExerciseOpen] = useState(false)

  const deleteExercise = useDeleteStudentExercise({ programId })
  const reorderExercises = useReorderStudentExercises({ programId })

  const sortedExercises = [...workoutDay.studentExercises].sort((a, b) => a.order - b.order)
  const isMutatingExercises = deleteExercise.isPending || reorderExercises.isPending

  function handleMoveExerciseUp(exercise: StudentExerciseItem) {
    const index = sortedExercises.findIndex((e) => e.id === exercise.id)
    if (index <= 0) return
    const newOrder = [...sortedExercises]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reorderExercises.mutate({
      workoutDayId: workoutDay.id,
      data: { items: newOrder.map((e, i) => ({ id: e.id, order: i })) },
    })
  }

  function handleMoveExerciseDown(exercise: StudentExerciseItem) {
    const index = sortedExercises.findIndex((e) => e.id === exercise.id)
    if (index >= sortedExercises.length - 1) return
    const newOrder = [...sortedExercises]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    reorderExercises.mutate({
      workoutDayId: workoutDay.id,
      data: { items: newOrder.map((e, i) => ({ id: e.id, order: i })) },
    })
  }

  return (
    <>
      <Card data-testid="workout-day-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={onToggle}
              data-testid="workout-day-toggle"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{workoutDay.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  ({workoutDay.studentExercises.length} exercício
                  {workoutDay.studentExercises.length !== 1 ? "s" : ""})
                </span>
              </div>
              {workoutDay.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{workoutDay.description}</p>
              )}
            </button>

            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={isFirst || isMutatingDays}
                onClick={() => onMoveUp(workoutDay)}
                data-testid="move-day-up"
              >
                <ChevronUp className="size-3.5" />
                <span className="sr-only">Mover dia para cima</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={isLast || isMutatingDays}
                onClick={() => onMoveDown(workoutDay)}
                data-testid="move-day-down"
              >
                <ChevronDown className="size-3.5" />
                <span className="sr-only">Mover dia para baixo</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                disabled={isMutatingDays}
                onClick={() => onDelete(workoutDay.id)}
                data-testid="delete-workout-day"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Remover dia</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={onToggle}
              >
                {isExpanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronDown className="size-4 -rotate-90" />
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
                description="Este dia de treino não possui exercícios."
                className="py-6"
              />
            ) : (
              <div className="space-y-1.5">
                {sortedExercises.map((exercise, index) => (
                  <StudentExerciseItemRow
                    key={exercise.id}
                    exercise={exercise}
                    isFirst={index === 0}
                    isLast={index === sortedExercises.length - 1}
                    isMutating={isMutatingExercises}
                    onEdit={(ex) => setEditExercise(ex)}
                    onDelete={(id) => deleteExercise.mutate(id)}
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
              className="w-full mt-2"
              onClick={() => setAddExerciseOpen(true)}
              data-testid="add-exercise-button"
            >
              <Plus className="size-4 mr-1" />
              Adicionar exercício
            </Button>
          </CardContent>
        )}
      </Card>

      <UpdateStudentExerciseDialog
        open={!!editExercise}
        onOpenChange={(open) => !open && setEditExercise(null)}
        exercise={editExercise}
        programId={programId}
      />

      <AddStudentExerciseDialog
        open={addExerciseOpen}
        onOpenChange={setAddExerciseOpen}
        workoutDayId={workoutDay.id}
        programId={programId}
      />
    </>
  )
}
