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
import { useDeleteWorkoutTemplate } from "@/features/trainingTemplates/hooks/useDeleteWorkoutTemplate"
import type { WorkoutTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface DeleteWorkoutDialogProps {
  workout: WorkoutTemplateItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
}

export function DeleteWorkoutDialog({
  workout,
  open,
  onOpenChange,
  templateId,
}: DeleteWorkoutDialogProps) {
  const deleteWorkout = useDeleteWorkoutTemplate({ templateId })

  function handleConfirm() {
    if (!workout) return
    deleteWorkout.mutate(workout.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover treino</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>{workout?.name}</strong>? Todos os exercícios
            deste treino serão removidos também.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteWorkout.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteWorkout.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="confirm-delete-workout"
          >
            {deleteWorkout.isPending ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
