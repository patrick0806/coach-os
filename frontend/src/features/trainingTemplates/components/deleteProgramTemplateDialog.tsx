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
import { useDeleteProgramTemplate } from "@/features/trainingTemplates/hooks/useDeleteProgramTemplate"
import type { ProgramTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface DeleteProgramTemplateDialogProps {
  template: ProgramTemplateItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProgramTemplateDialog({
  template,
  open,
  onOpenChange,
}: DeleteProgramTemplateDialogProps) {
  const deleteTemplate = useDeleteProgramTemplate()

  function handleConfirm() {
    if (!template) return
    deleteTemplate.mutate(template.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir programa</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{template?.name}</strong>? Esta ação não pode
            ser desfeita e todos os treinos associados serão removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTemplate.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteTemplate.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="confirm-delete-template"
          >
            {deleteTemplate.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
