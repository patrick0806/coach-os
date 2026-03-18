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
import { useDeleteServicePlan } from "@/features/servicePlans/hooks/useDeleteServicePlan"
import type { ServicePlanItem } from "@/features/servicePlans/types/servicePlans.types"

interface DeleteServicePlanDialogProps {
  plan: ServicePlanItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteServicePlanDialog({ plan, open, onOpenChange }: DeleteServicePlanDialogProps) {
  const deletePlan = useDeleteServicePlan()

  function handleConfirm() {
    if (!plan) return
    deletePlan.mutate(plan.id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="delete-service-plan-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir plano</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{plan?.name}</strong>? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePlan.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deletePlan.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletePlan.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
