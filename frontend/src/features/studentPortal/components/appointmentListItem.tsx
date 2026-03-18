"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ExternalLink, MapPin, Video } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { cn } from "@/lib/utils"
import type { StudentAppointment } from "@/features/studentPortal/types/studentPortalSchedule.types"

interface AppointmentListItemProps {
  appointment: StudentAppointment
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  completed: "Concluída",
  cancelled: "Cancelada",
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
}

export function AppointmentListItem({ appointment }: AppointmentListItemProps) {
  const startDate = parseISO(appointment.startAt)
  const endDate = parseISO(appointment.endAt)

  const formattedDate = format(startDate, "EEE, dd/MM", { locale: ptBR })
  const formattedTime = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`

  return (
    <div
      className={cn(
        "flex items-start justify-between rounded-lg border px-4 py-3",
        appointment.status === "cancelled" && "opacity-60",
      )}
      data-testid="appointment-item"
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium capitalize">{formattedDate}</p>
        <p className="text-xs text-muted-foreground">{formattedTime}</p>

        {appointment.appointmentType === "online" ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Video className="h-3 w-3" />
            <span>Online</span>
            {appointment.meetingUrl && appointment.status === "scheduled" && (
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-primary hover:underline flex items-center gap-0.5"
                data-testid="meeting-link"
              >
                Entrar
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{appointment.location ?? "Presencial"}</span>
          </div>
        )}
      </div>

      <Badge variant={STATUS_VARIANTS[appointment.status] ?? "outline"}>
        {STATUS_LABELS[appointment.status] ?? appointment.status}
      </Badge>
    </div>
  )
}
