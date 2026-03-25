"use client"

import { AlertTriangle, MapPin, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import type { UnifiedCalendarEntry } from "@/features/scheduling/types/scheduling.types"

interface CalendarEventProps {
  entry: UnifiedCalendarEntry
  hasOverlap?: boolean
  style?: React.CSSProperties
  onClick?: () => void
}

function getEventStyles(entry: UnifiedCalendarEntry) {
  if (entry.type === "block") {
    return "bg-destructive/10 border-destructive text-destructive-foreground"
  }
  if (entry.type === "booking") {
    return "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300"
  }
  // one_off or override
  if (entry.status === "completed") {
    return "bg-muted border-border text-muted-foreground"
  }
  if (entry.status === "cancelled") {
    return "bg-muted/50 border-border text-muted-foreground opacity-50"
  }
  return "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300"
}

function getTimeStr(isoString: string): string {
  const d = new Date(isoString)
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
}

function getEventLabel(entry: UnifiedCalendarEntry) {
  if (entry.type === "block") {
    return entry.notes ? `Bloqueado — ${entry.notes}` : "Bloqueado"
  }
  if (entry.type === "booking") {
    return `Treino — ${entry.studentName ?? "Aluno"}`
  }
  // one_off or override
  const name = entry.studentName ?? "Aluno"
  if (entry.status === "completed") return `${name} ✓`
  if (entry.status === "cancelled") return `${name} ✗`
  return name
}

export function CalendarEvent({ entry, hasOverlap, style, onClick }: CalendarEventProps) {
  const label = getEventLabel(entry)
  const styles = getEventStyles(entry)
  const timeLabel = `${getTimeStr(entry.startAt)} – ${getTimeStr(entry.endAt)}`

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
      <div className="text-[10px] opacity-70 truncate">{timeLabel}</div>
      {(entry.type === "one_off" || entry.type === "override") && entry.appointmentType === "online" && (
        <Video className="size-2.5 mt-0.5 opacity-60" />
      )}
      {(entry.type === "one_off" || entry.type === "override") && entry.appointmentType === "presential" && (
        <MapPin className="size-2.5 mt-0.5 opacity-60" />
      )}
    </div>
  )
}
