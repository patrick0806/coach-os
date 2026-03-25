"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin, Video, ExternalLink } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Badge } from "@/shared/ui/badge"
import { useCancelEvent } from "@/features/scheduling/hooks/useCancelEvent"
import { useCompleteEvent } from "@/features/scheduling/hooks/useCompleteEvent"
import { RescheduleEventDialog } from "./rescheduleEventDialog"
import type { UnifiedCalendarEntry } from "@/features/scheduling/types/scheduling.types"

interface EventDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: UnifiedCalendarEntry | null
}

const statusLabel: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluido",
  cancelled: "Cancelado",
  no_show: "Nao compareceu",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "outline",
}

export function EventDetailDialog({
  open,
  onOpenChange,
  entry,
}: EventDetailDialogProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const cancel = useCancelEvent({ onSuccess: () => onOpenChange(false) })
  const complete = useCompleteEvent({ onSuccess: () => onOpenChange(false) })

  if (!entry) return null

  const start = new Date(entry.startAt)
  const end = new Date(entry.endAt)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do evento</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{entry.studentName ?? "Evento"}</span>
              <Badge variant={statusVariant[entry.status] ?? "secondary"}>
                {statusLabel[entry.status] ?? entry.status}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Data:</span>{" "}
                {format(start, "PPP", { locale: ptBR })}
              </p>
              <p>
                <span className="font-medium text-foreground">Horario:</span>{" "}
                {format(start, "HH:mm")} – {format(end, "HH:mm")}
              </p>
              {entry.appointmentType && (
                <p className="flex items-center gap-1">
                  <span className="font-medium text-foreground">Tipo:</span>{" "}
                  {entry.appointmentType === "online" ? (
                    <>
                      <Video className="size-3.5" /> Online
                    </>
                  ) : (
                    <>
                      <MapPin className="size-3.5" /> Presencial
                    </>
                  )}
                </p>
              )}
              {entry.location && (
                <p>
                  <span className="font-medium text-foreground">Local:</span> {entry.location}
                </p>
              )}
              {entry.meetingUrl && (
                <p>
                  <span className="font-medium text-foreground">Link:</span>{" "}
                  <a
                    href={entry.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline inline-flex items-center gap-1"
                  >
                    Abrir link <ExternalLink className="size-3" />
                  </a>
                </p>
              )}
              {entry.notes && (
                <p>
                  <span className="font-medium text-foreground">Observacoes:</span>{" "}
                  {entry.notes}
                </p>
              )}
            </div>
          </div>

          {entry.status === "scheduled" && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => cancel.mutate({ id: entry.id })}
                disabled={cancel.isPending || complete.isPending}
              >
                {cancel.isPending ? "Cancelando..." : "Cancelar sessao"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => setRescheduleOpen(true), 150)
                }}
                disabled={cancel.isPending || complete.isPending}
                data-testid="reschedule-button"
              >
                Reagendar
              </Button>
              <Button
                onClick={() => complete.mutate(entry.id)}
                disabled={cancel.isPending || complete.isPending}
              >
                {complete.isPending ? "Concluindo..." : "Marcar como concluido"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <RescheduleEventDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        entry={entry}
      />
    </>
  )
}
