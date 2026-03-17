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
import { useDeleteExerciseTemplate } from "@/features/trainingTemplates/hooks/useDeleteExerciseTemplate"
import type { ExerciseTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface DeleteExerciseTemplateDialogProps {
  exerciseTemplate: ExerciseTemplateItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
}

export function DeleteExerciseTemplateDialog({
  exerciseTemplate,
  open,
  onOpenChange,
  templateId,
}: DeleteExerciseTemplateDialogProps) {
  const deleteExerciseTemplate = useDeleteExerciseTemplate({ templateId })

  function handleConfirm() {
    if (!exerciseTemplate) return
    deleteExerciseTemplate.mutate(exerciseTemplate.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover exercício</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover{" "}
            <strong>{exerciseTemplate?.exercise.name}</strong> deste treino?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteExerciseTemplate.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteExerciseTemplate.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="confirm-delete-exercise-template"
          >
            {deleteExerciseTemplate.isPending ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
