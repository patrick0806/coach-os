"use client"

import { useState } from "react"
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"
import { CalendarDayColumn, HOUR_START, HOUR_END, HOUR_HEIGHT_PX } from "./calendarDayColumn"
import { AppointmentDetailDialog } from "./appointmentDetailDialog"
import { useCalendar } from "@/features/scheduling/hooks/useCalendar"
import { useAppointments } from "@/features/scheduling/hooks/useAppointments"
import type { AvailabilityRuleItem, CalendarEntry, AppointmentItem } from "@/features/scheduling/types/scheduling.types"

const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

interface WeeklyCalendarProps {
  onSlotClick?: (date: string, time: string) => void
  availabilityRules?: AvailabilityRuleItem[]
  exceptionDates?: string[]
}

export function WeeklyCalendar({ onSlotClick, availabilityRules = [], exceptionDates = [] }: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })

  const { data: calendarEntries = [], isLoading } = useCalendar(currentWeekStart, weekEnd)

  // For appointment detail: fetch appointment data by sourceId when clicked
  const { data: appointmentsData } = useAppointments({ size: 100 })

  function goToPrevWeek() {
    setCurrentWeekStart((w) => subWeeks(w, 1))
  }

  function goToNextWeek() {
    setCurrentWeekStart((w) => addWeeks(w, 1))
  }

  function goToToday() {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  function getEntriesForDay(day: Date): CalendarEntry[] {
    const dayStr = format(day, "yyyy-MM-dd")
    return calendarEntries.filter((e) => e.date === dayStr)
  }

  function handleEventClick(entry: CalendarEntry) {
    if (entry.type === "appointment") {
      const appointment = appointmentsData?.content.find((a) => a.id === entry.sourceId)
      if (appointment) {
        setSelectedAppointment(appointment)
        setDetailOpen(true)
      }
    }
  }

  const weekLabel = `${format(currentWeekStart, "d MMM", { locale: ptBR })} – ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`

  return (
    <>
      {/* Week navigation */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="icon" onClick={goToPrevWeek} className="size-8">
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Hoje
        </Button>
        <Button variant="outline" size="icon" onClick={goToNextWeek} className="size-8">
          <ChevronRight className="size-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-1 capitalize">{weekLabel}</span>
        {isLoading && <span className="text-xs text-muted-foreground ml-2">Carregando...</span>}
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border bg-muted/30">
          <div className="p-2" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center text-xs font-medium",
                isToday(day) && "text-primary"
              )}
            >
              <div className="capitalize">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div
                className={cn(
                  "text-base font-semibold",
                  isToday(day) &&
                  "rounded-full bg-primary text-primary-foreground size-7 flex items-center justify-center mx-auto"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <div className="grid grid-cols-[48px_repeat(7,1fr)]">
            {/* Time labels */}
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="text-[10px] text-muted-foreground text-right pr-2 border-b border-border/50"
                  style={{ height: HOUR_HEIGHT_PX }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const entries = getEntriesForDay(day)
              const dayStr = format(day, "yyyy-MM-dd")
              // dayOfWeek: 0=Sun,1=Mon,...,6=Sat (matches date-fns getDay)
              const dayOfWeek = day.getDay()
              const rulesForDay = availabilityRules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive)
              const isExceptionDay = exceptionDates.includes(dayStr)
              return (
                <div
                  key={day.toISOString()}
                  className="border-l border-border/50 relative"
                >
                  {/* Clickable time slots */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                      style={{ height: HOUR_HEIGHT_PX }}
                      onClick={() =>
                        onSlotClick?.(
                          dayStr,
                          `${String(h).padStart(2, "0")}:00`
                        )
                      }
                    />
                  ))}
                  {/* Events overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="pointer-events-auto">
                      <CalendarDayColumn
                        entries={entries.filter((e) => e.startTime && e.endTime)}
                        availabilityRules={rulesForDay}
                        isExceptionDay={isExceptionDay}
                        onEventClick={handleEventClick}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <AppointmentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        appointment={selectedAppointment}
      />
    </>
  )
}
