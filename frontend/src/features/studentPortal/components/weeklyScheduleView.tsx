"use client"

import { Clock, MapPin } from "lucide-react"
import type { StudentRecurringSlot } from "@/features/studentPortal/types/studentPortalSchedule.types"

interface WeeklyScheduleViewProps {
  slots: StudentRecurringSlot[]
}

const WEEKDAYS = [
  { key: 1, label: "Seg" },
  { key: 2, label: "Ter" },
  { key: 3, label: "Qua" },
  { key: 4, label: "Qui" },
  { key: 5, label: "Sex" },
]

export function WeeklyScheduleView({ slots }: WeeklyScheduleViewProps) {
  const byDay = slots.reduce<Record<number, StudentRecurringSlot[]>>(
    (acc, slot) => {
      if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = []
      acc[slot.dayOfWeek].push(slot)
      return acc
    },
    {},
  )

  return (
    <div data-testid="weekly-schedule-view">
      <div className="grid grid-cols-5 border-b border-border/40 bg-muted/30">
        {WEEKDAYS.map(({ key, label }) => (
          <div
            key={key}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1.5 p-3">
        {WEEKDAYS.map(({ key }) => {
          const daySlots = byDay[key]
          return daySlots && daySlots.length > 0 ? (
            <div
              key={key}
              className="flex flex-col items-center rounded-lg border border-primary/30 bg-primary/10 px-1 py-2.5 text-center text-primary"
              data-testid="schedule-day-active"
            >
              <Clock className="mb-1 h-3 w-3 opacity-70" />
              <p className="text-[10px] font-semibold leading-none">{daySlots[0].startTime}</p>
              {daySlots[0].location && (
                <p className="mt-0.5 text-[8px] leading-tight opacity-70 flex items-center gap-0.5">
                  <MapPin className="h-2 w-2" />
                  {daySlots[0].location}
                </p>
              )}
              <p className="mt-1 text-[9px] leading-tight opacity-80">Treino</p>
              {daySlots.length > 1 && (
                <p className="text-[8px] opacity-60">+{daySlots.length - 1}</p>
              )}
            </div>
          ) : (
            <div
              key={key}
              className="flex items-center justify-center rounded-lg border border-dashed border-border/40 py-4"
              data-testid="schedule-day-free"
            >
              <span className="text-[9px] text-muted-foreground/40">livre</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
