"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { getApiErrorMessage } from "@/lib/api-error";
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/services/exercises.service";
import { removeExerciseFromPlan, type WorkoutExercise } from "@/services/workout-plans.service";

interface ExerciseRowProps {
  exercise: WorkoutExercise;
  isFirst: boolean;
  isLast: boolean;
  planId: string;
  onReorder: (id: string, direction: "up" | "down") => void;
  onRemoved: () => void;
}

export function ExerciseRow({
  exercise,
  isFirst,
  isLast,
  planId,
  onReorder,
  onRemoved,
}: ExerciseRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const removeMutation = useMutation({
    mutationFn: () => removeExerciseFromPlan(planId, exercise.id),
    onSuccess: () => {
      toast.success("Exercício removido.");
      onRemoved();
      setConfirmOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível remover o exercício."));
    },
  });

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onReorder(exercise.id, "up")}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onReorder(exercise.id, "down")}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          >
            <ArrowDown className="size-3.5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{exercise.exerciseName}</span>
            <Badge
              className={`text-xs font-medium ${MUSCLE_GROUP_COLORS[exercise.muscleGroup as MuscleGroup] ?? "bg-gray-100 text-gray-600"}`}
            >
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ?? exercise.muscleGroup}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {exercise.sets} séries × {exercise.repetitions} reps
            {exercise.load ? ` — ${exercise.load}` : ""}
          </p>
          {exercise.notes ? (
            <p className="mt-0.5 text-xs italic text-gray-400">{exercise.notes}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
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
            <AlertDialogCancel disabled={removeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
