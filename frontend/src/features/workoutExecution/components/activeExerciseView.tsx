"use client"

import { useState } from "react"
import { Check, Dumbbell, SkipForward } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"
import type { CompletedSetData } from "@/features/workoutExecution/types/workoutExecution.types"

interface ActiveExerciseViewProps {
  exercise: StudentExerciseItem
  currentSetNumber: number
  completedSets: CompletedSetData[]
  onSetComplete: (data: { reps: number; weight: string; status: "completed" | "skipped" }) => void
}

export function ActiveExerciseView({
  exercise,
  currentSetNumber,
  completedSets,
  onSetComplete,
}: ActiveExerciseViewProps) {
  const [reps, setReps] = useState<string>(exercise.repetitions?.toString() ?? "")
  const [weight, setWeight] = useState<string>(exercise.plannedWeight ?? "")

  const totalSets = exercise.sets

  function handleComplete(status: "completed" | "skipped") {
    onSetComplete({
      reps: parseInt(reps || "0", 10),
      weight: weight || "0",
      status,
    })
    // Reset inputs with planned values for next set
    setReps(exercise.repetitions?.toString() ?? "")
    setWeight(exercise.plannedWeight ?? "")
  }

  return (
    <div className="space-y-4" data-testid="active-exercise-view">
      {/* Exercise header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold truncate">{exercise.exercise.name}</p>
          <p className="text-xs text-muted-foreground">
            {totalSets} séries
            {exercise.repetitions ? ` × ${exercise.repetitions} reps` : ""}
            {exercise.plannedWeight ? ` — ${exercise.plannedWeight}kg` : ""}
          </p>
        </div>
        <div className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1">
          <span className="text-xs font-medium text-primary">
            Série {currentSetNumber}/{totalSets}
          </span>
        </div>
      </div>

      {/* Sets list */}
      <div className="space-y-2">
        {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => {
          const completed = completedSets.find((s) => s.setNumber === setNum)
          const isActive = setNum === currentSetNumber
          const isFuture = setNum > currentSetNumber

          if (completed) {
            // Completed set
            return (
              <div
                key={setNum}
                className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5"
                data-testid={`set-row-${setNum}`}
              >
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">Série {setNum}</span>
                <span className="text-xs font-semibold">
                  {completed.performedReps} reps · {completed.usedWeight}kg
                </span>
              </div>
            )
          }

          if (isActive) {
            // Active set with inputs
            return (
              <div
                key={setNum}
                className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-3"
                data-testid={`set-row-${setNum}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-sm font-medium text-primary">Série {setNum}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Reps
                    </label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={exercise.repetitions?.toString() ?? "Reps"}
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="h-10 text-center text-base"
                      data-testid={`reps-input-${setNum}`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Kg
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder={exercise.plannedWeight ?? "Kg"}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="h-10 text-center text-base"
                      data-testid={`weight-input-${setNum}`}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1.5 text-muted-foreground"
                    onClick={() => handleComplete("skipped")}
                  >
                    <SkipForward className="h-4 w-4" />
                    Pular
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => handleComplete("completed")}
                    data-testid={`complete-set-${setNum}`}
                  >
                    <Check className="h-4 w-4" />
                    Concluir Série
                  </Button>
                </div>
              </div>
            )
          }

          // Future set (dimmed)
          if (isFuture) {
            return (
              <div
                key={setNum}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 opacity-40"
                data-testid={`set-row-${setNum}`}
              >
                <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                <span className="text-xs text-muted-foreground flex-1">Série {setNum}</span>
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
