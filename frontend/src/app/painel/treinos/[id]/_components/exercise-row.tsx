"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/services/exercises.service";
import { type WorkoutExercise } from "@/services/workout-plans.service";

interface ExerciseRowProps {
  exercise: WorkoutExercise;
  isFirst: boolean;
  isLast: boolean;
  onReorder: (id: string, direction: "up" | "down") => void;
  onRemove: (exercise: WorkoutExercise) => void;
}

export function ExerciseRow({
  exercise,
  isFirst,
  isLast,
  onReorder,
  onRemove,
}: ExerciseRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onReorder(exercise.id, "up")}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onReorder(exercise.id, "down")}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
          >
            <ArrowDown className="size-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{exercise.exerciseName}</span>
            <Badge
              className={`text-xs font-medium ${MUSCLE_GROUP_COLORS[exercise.muscleGroup as MuscleGroup] ?? "bg-muted text-muted-foreground"}`}
            >
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ?? exercise.muscleGroup}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {exercise.sets} séries × {exercise.repetitions} reps
            {exercise.load ? ` — ${exercise.load}` : ""}
          </p>
          {(exercise.restTime || exercise.executionTime) ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {exercise.restTime ? `Descanso: ${exercise.restTime}` : ""}
              {exercise.restTime && exercise.executionTime ? " · " : ""}
              {exercise.executionTime ? `Execução: ${exercise.executionTime}` : ""}
            </p>
          ) : null}
          {exercise.notes ? (
            <p className="mt-0.5 text-xs italic text-muted-foreground">{exercise.notes}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover exercício</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{exercise.exerciseName}</strong> deste plano?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmOpen(false);
                onRemove(exercise);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
