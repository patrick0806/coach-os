"use client"

import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ExternalLink, MapPin, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import type { StudentUnifiedCalendarEntry } from "@/features/studentPortal/types/studentPortalSchedule.types"

interface AppointmentListItemProps {
  event: StudentUnifiedCalendarEntry
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  completed: "Concluida",
  cancelled: "Cancelada",
  no_show: "Nao compareceu",
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-success/15 text-success",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
  no_show: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

export function AppointmentListItem({ event }: AppointmentListItemProps) {
  const startDate = parseISO(event.startAt)
  const endDate = parseISO(event.endAt)

  const formattedDate = format(startDate, "EEE, dd/MM", { locale: ptBR })
  const formattedTime = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`

  return (
    <div
      className={cn(
        "flex items-start justify-between rounded-xl border border-border/60 bg-card px-4 py-3",
        event.status === "cancelled" && "opacity-60",
      )}
      data-testid="appointment-item"
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium capitalize">{formattedDate}</p>
        <p className="text-xs text-muted-foreground">{formattedTime}</p>

        {event.appointmentType === "online" ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Video className="h-3 w-3" />
            <span>Online</span>
            {event.meetingUrl && event.status === "scheduled" && (
              <a
                href={event.meetingUrl}
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
        ) : event.appointmentType === "presential" ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{event.location ?? "Presencial"}</span>
          </div>
        ) : null}
      </div>

      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        STATUS_STYLES[event.status] ?? "bg-muted text-muted-foreground",
      )}>
        {STATUS_LABELS[event.status] ?? event.status}
      </span>
    </div>
  )
}
