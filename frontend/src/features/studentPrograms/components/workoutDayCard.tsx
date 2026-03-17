"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Dumbbell } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { EmptyState } from "@/shared/components/emptyState"
import { StudentExerciseItemRow } from "@/features/studentPrograms/components/studentExerciseItem"
import { UpdateStudentExerciseDialog } from "@/features/studentPrograms/components/updateStudentExerciseDialog"
import type {
  StudentExerciseItem,
  WorkoutDayItem,
} from "@/features/studentPrograms/types/studentPrograms.types"

interface WorkoutDayCardProps {
  workoutDay: WorkoutDayItem
  programId: string
  isExpanded: boolean
  onToggle: () => void
}

export function WorkoutDayCard({
  workoutDay,
  programId,
  isExpanded,
  onToggle,
}: WorkoutDayCardProps) {
  const [editExercise, setEditExercise] = useState<StudentExerciseItem | null>(null)

  const sortedExercises = [...workoutDay.studentExercises].sort((a, b) => a.order - b.order)

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

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
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
                {sortedExercises.map((exercise) => (
                  <StudentExerciseItemRow
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={(ex) => setEditExercise(ex)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <UpdateStudentExerciseDialog
        open={!!editExercise}
        onOpenChange={(open) => !open && setEditExercise(null)}
        exercise={editExercise}
        programId={programId}
      />
    </>
  )
}
