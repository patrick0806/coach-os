"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
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
import { useCancelAppointment } from "@/features/scheduling/hooks/useCancelAppointment"
import { useCompleteAppointment } from "@/features/scheduling/hooks/useCompleteAppointment"
import { RescheduleAppointmentDialog } from "@/features/scheduling/components/rescheduleAppointmentDialog"
import type { AppointmentItem } from "@/features/scheduling/types/scheduling.types"

interface AppointmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentItem | null
}

const statusLabel: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
}

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
}: AppointmentDetailDialogProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const cancel = useCancelAppointment({ onSuccess: () => onOpenChange(false) })
  const complete = useCompleteAppointment({ onSuccess: () => onOpenChange(false) })

  if (!appointment) return null

  const start = parseISO(appointment.startAt)
  const end = parseISO(appointment.endAt)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{appointment.studentName}</span>
              <Badge variant={statusVariant[appointment.status] ?? "secondary"}>
                {statusLabel[appointment.status] ?? appointment.status}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Data:</span>{" "}
                {format(start, "PPP", { locale: ptBR })}
              </p>
              <p>
                <span className="font-medium text-foreground">Horário:</span>{" "}
                {format(start, "HH:mm")} – {format(end, "HH:mm")}
              </p>
              <p className="flex items-center gap-1">
                <span className="font-medium text-foreground">Tipo:</span>{" "}
                {appointment.type === "online" ? (
                  <>
                    <Video className="size-3.5" /> Online
                  </>
                ) : (
                  <>
                    <MapPin className="size-3.5" /> Presencial
                  </>
                )}
              </p>
              {appointment.location && (
                <p>
                  <span className="font-medium text-foreground">Local:</span> {appointment.location}
                </p>
              )}
              {appointment.meetingUrl && (
                <p>
                  <span className="font-medium text-foreground">Link:</span>{" "}
                  <a
                    href={appointment.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline flex items-center gap-1 inline-flex"
                  >
                    Abrir link <ExternalLink className="size-3" />
                  </a>
                </p>
              )}
              {appointment.notes && (
                <p>
                  <span className="font-medium text-foreground">Observações:</span>{" "}
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>

          {appointment.status === "scheduled" && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => cancel.mutate(appointment.id)}
                disabled={cancel.isPending || complete.isPending}
              >
                {cancel.isPending ? "Cancelando..." : "Cancelar sessão"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onOpenChange(false)
                  // Delay opening the reschedule dialog until detail dialog closes
                  setTimeout(() => setRescheduleOpen(true), 150)
                }}
                disabled={cancel.isPending || complete.isPending}
                data-testid="reschedule-button"
              >
                Reagendar
              </Button>
              <Button
                onClick={() => complete.mutate(appointment.id)}
                disabled={cancel.isPending || complete.isPending}
              >
                {complete.isPending ? "Concluindo..." : "Marcar como concluído"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <RescheduleAppointmentDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={appointment}
      />
    </>
  )
}
