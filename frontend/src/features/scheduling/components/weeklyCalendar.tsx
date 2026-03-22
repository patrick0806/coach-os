"use client"

import { useState } from "react"
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"
import { CalendarDayColumn, HOUR_START, HOUR_END, HOUR_HEIGHT_PX } from "./calendarDayColumn"
import { AppointmentDetailDialog } from "./appointmentDetailDialog"
import { TrainingScheduleDetailDialog } from "./trainingScheduleDetailDialog"
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
  const [mobileDay, setMobileDay] = useState(() => new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<CalendarEntry | null>(null)
  const [trainingDetailOpen, setTrainingDetailOpen] = useState(false)

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })

  const mobileDayEnd = addDays(mobileDay, 1)
  const { data: calendarEntries = [], isLoading } = useCalendar(currentWeekStart, weekEnd)
  const { data: mobileEntries = [], isLoading: mobileLoading } = useCalendar(mobileDay, mobileDayEnd)
  const { data: appointmentsData } = useAppointments({ size: 100 })

  function goToPrevWeek() { setCurrentWeekStart((w) => subWeeks(w, 1)) }
  function goToNextWeek() { setCurrentWeekStart((w) => addWeeks(w, 1)) }
  function goToToday() {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setMobileDay(new Date())
  }
  function goToPrevDay() { setMobileDay((d) => subDays(d, 1)) }
  function goToNextDay() { setMobileDay((d) => addDays(d, 1)) }

  function getEntriesForDay(day: Date): CalendarEntry[] {
    const dayStr = format(day, "yyyy-MM-dd")
    return calendarEntries.filter((e) => e.date === dayStr)
  }

  function getMobileEntriesForDay(): CalendarEntry[] {
    const dayStr = format(mobileDay, "yyyy-MM-dd")
    return mobileEntries.filter((e) => e.date === dayStr)
  }

  function handleEventClick(entry: CalendarEntry) {
    if (entry.type === "appointment") {
      const appointment = appointmentsData?.content.find((a) => a.id === entry.sourceId)
      if (appointment) {
        setSelectedAppointment(appointment)
        setDetailOpen(true)
      }
    } else if (entry.type === "training_schedule") {
      setSelectedTraining(entry)
      setTrainingDetailOpen(true)
    }
  }

  const weekLabel = `${format(currentWeekStart, "d MMM", { locale: ptBR })} – ${format(weekEnd, "d MMM yyyy", { locale: ptBR })}`
  const mobileDayLabel = format(mobileDay, "EEEE, d 'de' MMMM", { locale: ptBR })

  const mobileDayStr = format(mobileDay, "yyyy-MM-dd")
  const mobileDayOfWeek = mobileDay.getDay()
  const mobileRules = availabilityRules.filter((r) => r.dayOfWeek === mobileDayOfWeek && r.isActive)
  const isMobileExceptionDay = exceptionDates.includes(mobileDayStr)

  // Count scheduled appointments this week for the badge
  const weekAppointmentCount = calendarEntries.filter(
    (e) => e.type === "appointment" && e.status !== "cancelled"
  ).length

  // Count scheduled mobile-day appointments
  const mobileDayAppointmentCount = getMobileEntriesForDay().filter(
    (e) => e.type === "appointment" && e.status !== "cancelled"
  ).length

  return (
    <>
      {/* ── MOBILE VIEW ── */}
      <div className="sm:hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
        {/* Header with day navigation */}
        <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Agenda</p>
              {mobileLoading && <span className="text-[10px] text-muted-foreground">...</span>}
            </div>
            <p className="text-sm font-semibold capitalize truncate">{mobileDayLabel}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {mobileDayAppointmentCount > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 mr-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-medium text-primary">{mobileDayAppointmentCount}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={goToPrevDay} className="size-8">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs px-2 h-8">
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextDay} className="size-8">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Exception indicator */}
        {isMobileExceptionDay && (
          <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-4 py-2">
            <span className="text-xs font-medium text-destructive">Dia bloqueado</span>
          </div>
        )}

        {/* Time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <div className="grid grid-cols-[44px_1fr]">
            {/* Time labels */}
            <div>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="text-[10px] text-muted-foreground text-right pr-2 border-b border-border/30"
                  style={{ height: HOUR_HEIGHT_PX }}
                >
                  {String(h).padStart(2, "0")}h
                </div>
              ))}
            </div>
            {/* Day column */}
            <div className="border-l border-border/30 relative">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors"
                  style={{ height: HOUR_HEIGHT_PX }}
                  onClick={() =>
                    onSlotClick?.(mobileDayStr, `${String(h).padStart(2, "0")}:00`)
                  }
                />
              ))}
              <div className="absolute inset-0 pointer-events-none">
                <div className="pointer-events-auto">
                  <CalendarDayColumn
                    entries={getMobileEntriesForDay().filter((e) => e.startTime && e.endTime)}
                    availabilityRules={mobileRules}
                    isExceptionDay={isMobileExceptionDay}
                    onEventClick={handleEventClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP VIEW (weekly) ── */}
      <div className="hidden sm:block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
        {/* Header with week navigation */}
        <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Agenda</p>
              {isLoading && <span className="text-[10px] text-muted-foreground">Carregando...</span>}
            </div>
            <p className="text-sm font-semibold capitalize">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {weekAppointmentCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 mr-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-primary">
                  {weekAppointmentCount} aula{weekAppointmentCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={goToPrevWeek} className="size-8">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="h-8">
              Hoje
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextWeek} className="size-8">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border/60 bg-muted/30">
          <div className="p-2" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center text-xs font-medium border-l border-border/40",
                isToday(day) && "text-primary"
              )}
            >
              <div className="capitalize text-muted-foreground text-[10px] tracking-wider">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div
                className={cn(
                  "text-base font-semibold mt-0.5",
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
                  className="text-[10px] text-muted-foreground text-right pr-2 border-b border-border/30"
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
              const dayOfWeek = day.getDay()
              const rulesForDay = availabilityRules.filter((r) => r.dayOfWeek === dayOfWeek && r.isActive)
              const isExceptionDay = exceptionDates.includes(dayStr)
              return (
                <div
                  key={day.toISOString()}
                  className="border-l border-border/30 relative"
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors"
                      style={{ height: HOUR_HEIGHT_PX }}
                      onClick={() =>
                        onSlotClick?.(dayStr, `${String(h).padStart(2, "0")}:00`)
                      }
                    />
                  ))}
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

      <TrainingScheduleDetailDialog
        open={trainingDetailOpen}
        onOpenChange={setTrainingDetailOpen}
        entry={selectedTraining}
      />
    </>
  )
}
