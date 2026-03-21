"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Dumbbell, Play } from "lucide-react"

import { studentAuthStore } from "@/stores/studentAuthStore"
import { useStudentProgramDetail } from "@/features/studentPortal/hooks/useStudentProgramDetail"
import { useStartSession } from "@/features/workoutExecution/hooks/useStartSession"
import { useFinishSession } from "@/features/workoutExecution/hooks/useFinishSession"
import { useCreateExecution } from "@/features/workoutExecution/hooks/useCreateExecution"
import { useRecordSet } from "@/features/workoutExecution/hooks/useRecordSet"
import { WorkoutStepper } from "@/features/workoutExecution/components/workoutStepper"
import { WorkoutCompletionScreen } from "@/features/workoutExecution/components/workoutCompletionScreen"
import { useCoachHref } from "@/lib/useCoachHref"
import { LoadingState } from "@/shared/components/loadingState"
import { Button } from "@/shared/ui/button"

type ExecutionState = "idle" | "started" | "finished"

interface PageProps {
  params: Promise<{ slug: string; programId: string; workoutDayId: string }>
}

export default function ExecutarTreinoPage({ params }: PageProps) {
  const { programId, workoutDayId } = use(params)
  const routeParams = useParams<{ slug: string }>()
  const href = useCoachHref(routeParams.slug)

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
          <Link href={href("/aluno/treinos")}>Voltar</Link>
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
          <Link href={href("/aluno/treinos")}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">{workoutDay.name}</h1>
          {workoutDay.description && (
            <p className="text-sm text-muted-foreground truncate">{workoutDay.description}</p>
          )}
        </div>
      </div>

      {/* Idle state: show exercises preview + start button */}
      {executionState === "idle" && (
        <>
          <div
            className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
            data-testid="exercises-preview"
          >
            {sortedExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  index < sortedExercises.length - 1 ? "border-b border-border/40" : ""
                }`}
                data-testid="exercise-preview-item"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{exercise.exercise.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {exercise.sets} séries
                    {exercise.repetitions ? ` × ${exercise.repetitions} reps` : ""}
                    {exercise.plannedWeight ? ` — ${exercise.plannedWeight}kg` : ""}
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

      {/* Started state: focused exercise stepper */}
      {executionState === "started" && sessionId && (
        <>
          <WorkoutStepper
            exercises={sortedExercises}
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
            onAllComplete={handleFinish}
          />

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
