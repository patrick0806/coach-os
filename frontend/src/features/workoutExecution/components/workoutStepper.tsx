"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { ActiveExerciseView } from "@/features/workoutExecution/components/activeExerciseView"
import { RestTimer } from "@/features/workoutExecution/components/restTimer"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"
import type {
  CompletedSetData,
  CreateExecutionResponse,
  RecordSetResponse,
} from "@/features/workoutExecution/types/workoutExecution.types"

type StepperPhase = "set" | "rest"

interface WorkoutStepperProps {
  exercises: StudentExerciseItem[]
  sessionId: string
  onCreateExecution: (studentExerciseId: string, exerciseId: string) => Promise<CreateExecutionResponse>
  onRecordSet: (data: {
    executionId: string
    setNumber: number
    performedReps: number
    usedWeight: string | null
    plannedReps: number | null
    plannedWeight: string | null
    restSeconds: number | null
    status: "completed" | "skipped"
  }) => Promise<RecordSetResponse>
  onAllComplete: () => void
}

export function WorkoutStepper({
  exercises,
  sessionId,
  onCreateExecution,
  onRecordSet,
  onAllComplete,
}: WorkoutStepperProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSetNumber, setCurrentSetNumber] = useState(1)
  const [phase, setPhase] = useState<StepperPhase>("set")
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [completedSets, setCompletedSets] = useState<CompletedSetData[]>([])
  const [isCreatingExecution, setIsCreatingExecution] = useState(false)
  const createdForIndex = useRef<number>(-1)

  const currentExercise = exercises[currentExerciseIndex]
  const totalExercises = exercises.length

  // Create execution when exercise changes
  const createExecutionForCurrent = useCallback(async () => {
    if (!currentExercise || createdForIndex.current === currentExerciseIndex) return
    createdForIndex.current = currentExerciseIndex

    setIsCreatingExecution(true)
    try {
      const execution = await onCreateExecution(currentExercise.id, currentExercise.exerciseId)
      setExecutionId(execution.id)
    } catch {
      // Error handled by mutation
    } finally {
      setIsCreatingExecution(false)
    }
  }, [currentExercise, currentExerciseIndex, onCreateExecution])

  useEffect(() => {
    createExecutionForCurrent()
  }, [createExecutionForCurrent])

  async function handleSetComplete(data: { reps: number; weight: string; status: "completed" | "skipped" }) {
    if (!executionId || !currentExercise) return

    try {
      await onRecordSet({
        executionId,
        setNumber: currentSetNumber,
        performedReps: data.reps,
        usedWeight: data.weight,
        plannedReps: currentExercise.repetitions,
        plannedWeight: currentExercise.plannedWeight,
        restSeconds: currentExercise.restSeconds,
        status: data.status,
      })

      const newCompletedSet: CompletedSetData = {
        setNumber: currentSetNumber,
        performedReps: data.reps,
        usedWeight: data.weight,
        status: data.status,
      }
      setCompletedSets((prev) => [...prev, newCompletedSet])

      const isLastSet = currentSetNumber >= currentExercise.sets

      if (isLastSet) {
        // Move to next exercise
        advanceToNextExercise()
      } else if (data.status === "completed" && currentExercise.restSeconds) {
        // Show rest timer
        setPhase("rest")
      } else {
        // Advance to next set directly
        setCurrentSetNumber((prev) => prev + 1)
      }
    } catch {
      // Error handled by mutation
    }
  }

  function advanceToNextExercise() {
    const nextIndex = currentExerciseIndex + 1
    if (nextIndex >= totalExercises) {
      onAllComplete()
    } else {
      setCurrentExerciseIndex(nextIndex)
      setCurrentSetNumber(1)
      setPhase("set")
      setExecutionId(null)
      setCompletedSets([])
    }
  }

  function handleRestComplete() {
    setCurrentSetNumber((prev) => prev + 1)
    setPhase("set")
  }

  function handleRestSkip() {
    handleRestComplete()
  }

  if (!currentExercise) return null

  // Progress bar segments
  const progressPercent = ((currentExerciseIndex) / totalExercises) * 100

  return (
    <div className="space-y-4" data-testid="workout-stepper">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Exercício {currentExerciseIndex + 1}/{totalExercises}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="flex gap-1">
          {exercises.map((_, i) => (
            <div
              key={exercises[i].id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentExerciseIndex
                  ? "bg-primary"
                  : i === currentExerciseIndex
                    ? "bg-primary/50"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Exercise content or rest timer */}
      {isCreatingExecution ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : phase === "rest" && currentExercise.restSeconds ? (
        <RestTimer
          seconds={currentExercise.restSeconds}
          onComplete={handleRestComplete}
          onSkip={handleRestSkip}
        />
      ) : (
        <ActiveExerciseView
          exercise={currentExercise}
          currentSetNumber={currentSetNumber}
          completedSets={completedSets}
          onSetComplete={handleSetComplete}
        />
      )}
    </div>
  )
}
