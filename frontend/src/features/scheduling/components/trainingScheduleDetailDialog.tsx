"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin, RotateCcw } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Badge } from "@/shared/ui/badge"
import { useSkipTraining } from "@/features/scheduling/hooks/useSkipTraining"
import { useDeleteTrainingException } from "@/features/scheduling/hooks/useDeleteTrainingException"
import { RescheduleTrainingDialog } from "./rescheduleTrainingDialog"
import type { CalendarEntry } from "@/features/scheduling/types/scheduling.types"

interface TrainingScheduleDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: CalendarEntry | null
}

export function TrainingScheduleDetailDialog({
  open,
  onOpenChange,
  entry,
}: TrainingScheduleDetailDialogProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const skip = useSkipTraining({ onSuccess: () => onOpenChange(false) })
  const deleteException = useDeleteTrainingException({ onSuccess: () => onOpenChange(false) })

  if (!entry) return null

  const date = parseISO(entry.date)
  const isRescheduled = entry.isRescheduled === true

  function handleSkip() {
    skip.mutate({
      scheduleId: entry!.sourceId,
      data: { originalDate: entry!.date },
    })
  }

  function handleUndoReschedule() {
    if (entry!.exceptionId) {
      deleteException.mutate(entry!.exceptionId)
    }
  }

  const isPending = skip.isPending || deleteException.isPending

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-testid="training-detail-dialog">
          <DialogHeader>
            <DialogTitle>Detalhes do treino</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{entry.studentName ?? "Aluno"}</span>
              {isRescheduled && (
                <Badge variant="secondary" className="gap-1">
                  <RotateCcw className="size-3" />
                  Reagendado
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Data:</span>{" "}
                {format(date, "PPP", { locale: ptBR })}
              </p>
              {entry.startTime && entry.endTime && (
                <p>
                  <span className="font-medium text-foreground">Horário:</span>{" "}
                  {entry.startTime} – {entry.endTime}
                </p>
              )}
              {entry.location && (
                <p className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  <span className="font-medium text-foreground">Local:</span>{" "}
                  {entry.location}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isRescheduled && entry.exceptionId ? (
              <Button
                variant="outline"
                onClick={handleUndoReschedule}
                disabled={isPending}
                data-testid="undo-reschedule-button"
              >
                {deleteException.isPending ? "Desfazendo..." : "Desfazer reagendamento"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isPending}
                  data-testid="skip-training-button"
                >
                  {skip.isPending ? "Pulando..." : "Pular esta ocorrência"}
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    setTimeout(() => setRescheduleOpen(true), 150)
                  }}
                  disabled={isPending}
                  data-testid="reschedule-training-button"
                >
                  Reagendar esta ocorrência
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RescheduleTrainingDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        entry={entry}
      />
    </>
  )
}
