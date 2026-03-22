"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Check, ChevronRight, Dumbbell } from "lucide-react"

import { ActiveExerciseView } from "@/features/workoutExecution/components/activeExerciseView"
import { RestTimer } from "@/features/workoutExecution/components/restTimer"
import { Button } from "@/shared/ui/button"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"
import type {
  CompletedSetData,
  CreateExecutionResponse,
  ExerciseExecutionData,
  RecordSetResponse,
} from "@/features/workoutExecution/types/workoutExecution.types"

type StepperPhase = "set" | "rest"
type ViewMode = "list" | "exercise"

interface ExerciseState {
  executionId: string | null
  completedSets: CompletedSetData[]
  currentSetNumber: number
  isComplete: boolean
}

interface WorkoutStepperProps {
  exercises: StudentExerciseItem[]
  sessionId: string
  initialExecutions?: ExerciseExecutionData[]
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
  sessionId: _sessionId,
  initialExecutions = [],
  onCreateExecution,
  onRecordSet,
  onAllComplete,
}: WorkoutStepperProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)
  const [phase, setPhase] = useState<StepperPhase>("set")
  const [isCreatingExecution, setIsCreatingExecution] = useState(false)

  // Build a lookup from studentExerciseId to execution data for hydration
  const executionsByStudentExerciseId = useRef(
    new Map(initialExecutions.map((exec) => [exec.studentExerciseId, exec])),
  )

  // Per-exercise state, keyed by exercise.id (studentExercise.id)
  const [exerciseStates, setExerciseStates] = useState<Record<string, ExerciseState>>(() => {
    const initial: Record<string, ExerciseState> = {}
    for (const ex of exercises) {
      const existingExec = executionsByStudentExerciseId.current.get(ex.id)
      if (existingExec && existingExec.exerciseSets.length > 0) {
        // Hydrate from existing execution data
        const completedSets: CompletedSetData[] = existingExec.exerciseSets.map((s) => ({
          setNumber: s.setNumber,
          performedReps: s.performedReps ?? 0,
          usedWeight: s.usedWeight ?? "0",
          status: s.completionStatus === "skipped" ? "skipped" : "completed",
        }))
        const maxSetNumber = Math.max(...existingExec.exerciseSets.map((s) => s.setNumber))
        const isComplete = maxSetNumber >= ex.sets
        initial[ex.id] = {
          executionId: existingExec.id,
          completedSets,
          currentSetNumber: isComplete ? maxSetNumber : maxSetNumber + 1,
          isComplete,
        }
      } else if (existingExec) {
        // Execution exists but no sets recorded yet
        initial[ex.id] = {
          executionId: existingExec.id,
          completedSets: [],
          currentSetNumber: 1,
          isComplete: false,
        }
      } else {
        initial[ex.id] = {
          executionId: null,
          completedSets: [],
          currentSetNumber: 1,
          isComplete: false,
        }
      }
    }
    return initial
  })

  // Track which exercises already have backend executions
  const createdExecutionFor = useRef<Set<string>>(
    new Set(initialExecutions.map((exec) => exec.studentExerciseId)),
  )

  const activeExercise = exercises.find((e) => e.id === activeExerciseId)
  const activeState = activeExerciseId ? exerciseStates[activeExerciseId] : null
  const completedCount = Object.values(exerciseStates).filter((s) => s.isComplete).length
  const totalExercises = exercises.length

  // Check if all exercises are complete
  const allComplete = completedCount === totalExercises
  const prevAllComplete = useRef(false)

  useEffect(() => {
    if (allComplete && !prevAllComplete.current) {
      onAllComplete()
    }
    prevAllComplete.current = allComplete
  }, [allComplete, onAllComplete])

  // Create execution when entering an exercise
  const createExecutionForExercise = useCallback(async (exercise: StudentExerciseItem) => {
    if (createdExecutionFor.current.has(exercise.id)) return
    createdExecutionFor.current.add(exercise.id)

    setIsCreatingExecution(true)
    try {
      const execution = await onCreateExecution(exercise.id, exercise.exerciseId)
      setExerciseStates((prev) => ({
        ...prev,
        [exercise.id]: { ...prev[exercise.id], executionId: execution.id },
      }))
    } catch {
      createdExecutionFor.current.delete(exercise.id)
    } finally {
      setIsCreatingExecution(false)
    }
  }, [onCreateExecution])

  function handleSelectExercise(exerciseId: string) {
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    setActiveExerciseId(exerciseId)
    setViewMode("exercise")
    setPhase("set")
    createExecutionForExercise(exercise)
  }

  function handleBackToList() {
    setViewMode("list")
    setActiveExerciseId(null)
    setPhase("set")
  }

  async function handleSetComplete(data: { reps: number; weight: string; status: "completed" | "skipped" }) {
    if (!activeExercise || !activeState?.executionId) return

    try {
      await onRecordSet({
        executionId: activeState.executionId,
        setNumber: activeState.currentSetNumber,
        performedReps: data.reps,
        usedWeight: data.weight,
        plannedReps: activeExercise.repetitions,
        plannedWeight: activeExercise.plannedWeight,
        restSeconds: activeExercise.restSeconds,
        status: data.status,
      })

      const newSet: CompletedSetData = {
        setNumber: activeState.currentSetNumber,
        performedReps: data.reps,
        usedWeight: data.weight,
        status: data.status,
      }

      const updatedSets = [...activeState.completedSets, newSet]
      const isLastSet = activeState.currentSetNumber >= activeExercise.sets

      setExerciseStates((prev) => ({
        ...prev,
        [activeExercise.id]: {
          ...prev[activeExercise.id],
          completedSets: updatedSets,
          currentSetNumber: isLastSet ? activeState.currentSetNumber : activeState.currentSetNumber + 1,
          isComplete: isLastSet,
        },
      }))

      if (isLastSet) {
        // Exercise done — go back to list
        setViewMode("list")
        setActiveExerciseId(null)
        setPhase("set")
      } else if (data.status === "completed" && activeExercise.restSeconds) {
        setPhase("rest")
      }
    } catch {
      // Error handled by mutation
    }
  }

  function handleRestComplete() {
    setPhase("set")
  }

  // Progress
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0

  return (
    <div className="space-y-4" data-testid="workout-stepper">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedCount}/{totalExercises} concluídos</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="flex gap-1">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                exerciseStates[ex.id]?.isComplete
                  ? "bg-primary"
                  : ex.id === activeExerciseId
                    ? "bg-primary/50"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* List view — pick any exercise */}
      {viewMode === "list" && (
        <div
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
          data-testid="exercise-list"
        >
          {exercises.map((exercise, index) => {
            const state = exerciseStates[exercise.id]
            const isComplete = state?.isComplete
            const setsInfo = state && state.completedSets.length > 0 && !isComplete
              ? `${state.completedSets.length}/${exercise.sets} séries`
              : null

            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => !isComplete && handleSelectExercise(exercise.id)}
                disabled={isComplete}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  index < exercises.length - 1 ? "border-b border-border/40" : ""
                } ${isComplete ? "opacity-50" : "hover:bg-muted/30"}`}
                data-testid="exercise-list-item"
              >
                {isComplete ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary bg-primary">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                ) : setsInfo ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                    {exercise.exercise.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isComplete ? (
                      "Concluído"
                    ) : setsInfo ? (
                      <span className="text-primary font-medium">{setsInfo}</span>
                    ) : (
                      <>
                        {exercise.sets} séries
                        {exercise.repetitions ? ` × ${exercise.repetitions} reps` : ""}
                        {exercise.plannedWeight ? ` — ${exercise.plannedWeight}kg` : ""}
                      </>
                    )}
                  </p>
                </div>

                {!isComplete && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Exercise focus view */}
      {viewMode === "exercise" && activeExercise && activeState && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="gap-1.5 text-muted-foreground -ml-2"
            data-testid="back-to-list-button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à lista
          </Button>

          {isCreatingExecution ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : phase === "rest" && activeExercise.restSeconds ? (
            <RestTimer
              seconds={activeExercise.restSeconds}
              onComplete={handleRestComplete}
              onSkip={handleRestComplete}
            />
          ) : (
            <ActiveExerciseView
              exercise={activeExercise}
              currentSetNumber={activeState.currentSetNumber}
              completedSets={activeState.completedSets}
              onSetComplete={handleSetComplete}
            />
          )}
        </>
      )}
    </div>
  )
}
