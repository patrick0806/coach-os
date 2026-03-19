"use client"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

interface ChangePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  onConfirm: () => void
  isLoading: boolean
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  planName,
  onConfirm,
  isLoading,
}: ChangePlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar troca de plano</DialogTitle>
          <DialogDescription>
            Você está prestes a mudar para o plano <strong>{planName}</strong>. A cobrança será
            feita de forma proporcional imediatamente. Deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Aguarde..." : "Confirmar troca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
