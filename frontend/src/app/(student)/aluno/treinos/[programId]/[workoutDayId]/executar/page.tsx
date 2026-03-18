"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"

import { studentAuthStore } from "@/stores/studentAuthStore"
import { useStudentProgramDetail } from "@/features/studentPortal/hooks/useStudentProgramDetail"
import { useStartSession } from "@/features/workoutExecution/hooks/useStartSession"
import { useFinishSession } from "@/features/workoutExecution/hooks/useFinishSession"
import { useCreateExecution } from "@/features/workoutExecution/hooks/useCreateExecution"
import { useRecordSet } from "@/features/workoutExecution/hooks/useRecordSet"
import { ExerciseExecutionCard } from "@/features/workoutExecution/components/exerciseExecutionCard"
import { WorkoutCompletionScreen } from "@/features/workoutExecution/components/workoutCompletionScreen"
import { LoadingState } from "@/shared/components/loadingState"
import { Button } from "@/shared/ui/button"

type ExecutionState = "idle" | "started" | "finished"

interface PageProps {
  params: Promise<{ programId: string; workoutDayId: string }>
}

export default function ExecutarTreinoPage({ params }: PageProps) {
  const { programId, workoutDayId } = use(params)

  const user = studentAuthStore.getUser()
  const studentId = user?.id ?? ""

  const { data: program, isLoading } = useStudentProgramDetail(programId)
  const { mutateAsync: startSession } = useStartSession()
  const { mutateAsync: finishSession } = useFinishSession()
  const { mutateAsync: createExecution } = useCreateExecution()
  const { mutateAsync: recordSet } = useRecordSet()

  const [executionState, setExecutionState] = useState<ExecutionState>("idle")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  if (isLoading) {
    return <LoadingState variant="card" />
  }

  // Find the workout day from the loaded program
  const workoutDay = program?.workoutDays.find((d) => d.id === workoutDayId)

  if (!workoutDay) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Dia de treino não encontrado.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/aluno/treinos">Voltar</Link>
        </Button>
      </div>
    )
  }

  const sortedExercises = [...workoutDay.studentExercises].sort((a, b) => a.order - b.order)

  async function handleStart() {
    setIsStarting(true)
    try {
      const session = await startSession({ studentId, workoutDayId })
      setSessionId(session.id)
      setExecutionState("started")
    } catch {
      // Error handled by mutation
    } finally {
      setIsStarting(false)
    }
  }

  async function handleFinish() {
    if (!sessionId) return

    setIsFinishing(true)
    try {
      await finishSession(sessionId)
      setExecutionState("finished")
    } catch {
      // Error handled by mutation
    } finally {
      setIsFinishing(false)
    }
  }

  if (executionState === "finished") {
    return <WorkoutCompletionScreen />
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/aluno/treinos">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold truncate">{workoutDay.name}</h1>
          {workoutDay.description && (
            <p className="text-sm text-muted-foreground truncate">{workoutDay.description}</p>
          )}
        </div>
      </div>

      {/* Idle state: show exercises preview + start button */}
      {executionState === "idle" && (
        <>
          <div className="space-y-3" data-testid="exercises-preview">
            {sortedExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-lg border px-4 py-3"
                data-testid="exercise-preview-item"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{exercise.exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.sets} séries
                    {exercise.repetitions ? ` × ${exercise.repetitions} reps` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full min-h-12 gap-2"
            onClick={handleStart}
            disabled={isStarting || sortedExercises.length === 0}
            data-testid="start-workout-button"
          >
            {isStarting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            {isStarting ? "Iniciando..." : "Iniciar Treino"}
          </Button>
        </>
      )}

      {/* Started state: record sets per exercise */}
      {executionState === "started" && sessionId && (
        <>
          <div className="space-y-3" data-testid="exercises-execution">
            {sortedExercises.map((exercise) => (
              <ExerciseExecutionCard
                key={exercise.id}
                exercise={exercise}
                sessionId={sessionId}
                onCreateExecution={async (studentExerciseId, exerciseId) =>
                  createExecution({ workoutSessionId: sessionId, studentExerciseId, exerciseId })
                }
                onRecordSet={async (data) =>
                  recordSet({
                    exerciseExecutionId: data.executionId,
                    setNumber: data.setNumber,
                    performedReps: data.performedReps,
                    usedWeight: data.usedWeight ? parseFloat(data.usedWeight) : null,
                    plannedReps: data.plannedReps ?? undefined,
                    plannedWeight: data.plannedWeight ? parseFloat(data.plannedWeight) : undefined,
                    restSeconds: data.restSeconds ?? undefined,
                    completionStatus: data.status,
                  })
                }
              />
            ))}
          </div>

          <Button
            className="w-full min-h-12"
            onClick={handleFinish}
            disabled={isFinishing}
            data-testid="finish-workout-button"
          >
            {isFinishing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "Finalizar Treino"
            )}
          </Button>
        </>
      )}
    </div>
  )
}
