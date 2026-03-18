"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Dumbbell } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { SetRow } from "@/features/workoutExecution/components/setRow"
import { RestTimer } from "@/features/workoutExecution/components/restTimer"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"
import type { CreateExecutionResponse, RecordSetResponse } from "@/features/workoutExecution/types/workoutExecution.types"

interface ExerciseExecutionCardProps {
  exercise: StudentExerciseItem
  sessionId: string
  onCreateExecution: (exerciseId: string) => Promise<CreateExecutionResponse>
  onRecordSet: (data: {
    executionId: string
    setNumber: number
    performedReps: number
    usedWeight: string
    plannedReps: number | null
    plannedWeight: string | null
    restSeconds: number | null
    status: "completed" | "skipped"
  }) => Promise<RecordSetResponse>
}

export function ExerciseExecutionCard({
  exercise,
  onCreateExecution,
  onRecordSet,
}: ExerciseExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [completedSets, setCompletedSets] = useState<number[]>([])
  const [showTimer, setShowTimer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const totalSets = exercise.sets

  async function handleOpen() {
    if (!isExpanded && !executionId) {
      setIsLoading(true)
      try {
        const execution = await onCreateExecution(exercise.exerciseId)
        setExecutionId(execution.id)
      } catch {
        // Ignore error — set will not be recorded
      } finally {
        setIsLoading(false)
      }
    }
    setIsExpanded((prev) => !prev)
  }

  async function handleSetComplete(
    setNumber: number,
    data: { reps: number; weight: string; status: "completed" | "skipped" }
  ) {
    if (!executionId || completedSets.includes(setNumber)) return

    try {
      await onRecordSet({
        executionId,
        setNumber,
        performedReps: data.reps,
        usedWeight: data.weight,
        plannedReps: exercise.repetitions,
        plannedWeight: exercise.plannedWeight,
        restSeconds: exercise.restSeconds,
        status: data.status,
      })

      setCompletedSets((prev) => [...prev, setNumber])

      // Show rest timer when a set is completed (not skipped) and there's a rest period
      if (data.status === "completed" && exercise.restSeconds) {
        setShowTimer(true)
      }
    } catch {
      // Ignore error
    }
  }

  const isFullyCompleted = completedSets.length >= totalSets

  return (
    <Card data-testid="exercise-execution-card">
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 text-left"
          onClick={handleOpen}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{exercise.exercise.name}</p>
            <p className="text-xs text-muted-foreground">
              {totalSets} séries
              {exercise.repetitions ? ` × ${exercise.repetitions} reps` : ""}
              {exercise.plannedWeight ? ` — ${exercise.plannedWeight}kg` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isFullyCompleted && (
              <Badge variant="secondary" className="text-xs">
                Concluído
              </Badge>
            )}
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-1">
            <span className="w-7" />
            <span className="flex-1 text-center text-xs text-muted-foreground">Reps</span>
            <span className="flex-1 text-center text-xs text-muted-foreground">Kg</span>
            <span className="w-20" />
          </div>

          {/* Set rows */}
          <div className="divide-y">
            {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => (
              <SetRow
                key={setNum}
                setNumber={setNum}
                plannedReps={exercise.repetitions}
                plannedWeight={exercise.plannedWeight}
                onComplete={(data) => handleSetComplete(setNum, data)}
                disabled={completedSets.includes(setNum) || !executionId}
              />
            ))}
          </div>

          {/* Rest timer */}
          {showTimer && exercise.restSeconds && (
            <div className="pt-2">
              <RestTimer
                seconds={exercise.restSeconds}
                onComplete={() => setShowTimer(false)}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
