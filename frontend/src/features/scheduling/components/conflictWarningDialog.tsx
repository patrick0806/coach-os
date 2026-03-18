"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog"
import type { ConflictDetail } from "@/features/scheduling/types/scheduling.types"

interface ConflictWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conflicts: ConflictDetail[]
  onForceCreate: () => void
  isPending?: boolean
}

const conflictTypeLabel: Record<string, string> = {
  appointment: "Agendamento existente",
  training_schedule: "Treino agendado",
  outside_availability: "Fora do horário disponível",
  exception: "Data bloqueada",
}

export function ConflictWarningDialog({
  open,
  onOpenChange,
  conflicts,
  onForceCreate,
  isPending,
}: ConflictWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="size-5" />
            Conflitos detectados
          </DialogTitle>
          <DialogDescription>
            Foram encontrados os seguintes conflitos neste horário. Você pode criar assim mesmo ou
            cancelar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {conflicts.map((conflict, i) => (
            <div key={i} className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {conflictTypeLabel[conflict.type] ?? conflict.type}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">{conflict.message}</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onForceCreate}
            disabled={isPending}
            data-testid="force-create-btn"
          >
            {isPending ? "Criando..." : "Criar mesmo assim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
