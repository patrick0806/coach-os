"use client"

import { AlertTriangle, MapPin, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CalendarEntry } from "@/features/scheduling/types/scheduling.types"

interface CalendarEventProps {
  entry: CalendarEntry
  hasOverlap?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

function getEventStyles(entry: CalendarEntry) {
  if (entry.type === "exception") {
    return "bg-destructive/10 border-destructive text-destructive-foreground"
  }
  if (entry.type === "training_schedule") {
    return "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300"
  }
  if (entry.type === "appointment") {
    if (entry.status === "completed") {
      return "bg-muted border-border text-muted-foreground"
    }
    if (entry.status === "cancelled") {
      return "bg-muted/50 border-border text-muted-foreground opacity-50"
    }
    return "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300"
  }
  return "bg-muted border-border"
}

function getEventLabel(entry: CalendarEntry) {
  if (entry.type === "exception") {
    return entry.reason ? `Bloqueado — ${entry.reason}` : "Bloqueado"
  }
  if (entry.type === "training_schedule") {
    return `Treino — ${entry.studentName ?? "Aluno"}`
  }
  if (entry.type === "appointment") {
    const name = entry.studentName ?? "Aluno"
    if (entry.status === "completed") return `${name} ✓`
    if (entry.status === "cancelled") return `${name} ✗`
    return name
  }
  return "Evento"
}

export function CalendarEvent({ entry, hasOverlap, style, onClick }: CalendarEventProps) {
  const label = getEventLabel(entry)
  const styles = getEventStyles(entry)
  const timeLabel =
    entry.startTime && entry.endTime ? `${entry.startTime} – ${entry.endTime}` : null

  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded border-l-2 px-1.5 py-0.5 text-xs overflow-hidden",
        "cursor-pointer hover:brightness-95 transition-all",
        styles
      )}
      style={style}
      onClick={onClick}
      title={label}
    >
      <div className="flex items-center gap-1 font-medium leading-tight truncate">
        {hasOverlap && <AlertTriangle className="size-3 shrink-0 text-amber-500" />}
        <span className="truncate">{label}</span>
      </div>
      {timeLabel && (
        <div className="text-[10px] opacity-70 truncate">{timeLabel}</div>
      )}
      {entry.type === "appointment" && entry.appointmentType === "online" && (
        <Video className="size-2.5 mt-0.5 opacity-60" />
      )}
      {entry.type === "appointment" && entry.appointmentType === "presential" && (
        <MapPin className="size-2.5 mt-0.5 opacity-60" />
      )}
    </div>
  )
}
