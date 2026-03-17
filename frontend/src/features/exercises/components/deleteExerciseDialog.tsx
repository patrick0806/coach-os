"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { useDeleteExercise } from "@/features/exercises/hooks/useDeleteExercise"
import type { ExerciseItem } from "@/features/exercises/types/exercises.types"

interface DeleteExerciseDialogProps {
  exercise: ExerciseItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteExerciseDialog({ exercise, open, onOpenChange }: DeleteExerciseDialogProps) {
  const deleteExercise = useDeleteExercise()

  function handleConfirm() {
    if (!exercise) return
    deleteExercise.mutate(exercise.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir exercício</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{exercise?.name}</strong>? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteExercise.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteExercise.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteExercise.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
