"use client"

import { addDays, format } from "date-fns"
import { CalendarDays } from "lucide-react"

import { useStudentMyRecurringSlots } from "@/features/studentPortal/hooks/useStudentTrainingSchedules"
import { useStudentMyCalendar } from "@/features/studentPortal/hooks/useStudentMyAppointments"
import { AgendaCard } from "@/features/studentPortal/components/agendaCard"
import { WeeklyScheduleView } from "@/features/studentPortal/components/weeklyScheduleView"
import { AppointmentListItem } from "@/features/studentPortal/components/appointmentListItem"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"

export default function StudentAgendaPage() {
  const today = new Date()
  const thirtyDaysLater = addDays(today, 30)

  const { data: slotsData, isLoading: slotsLoading } =
    useStudentMyRecurringSlots()

  const { data: calendarData, isLoading: calendarLoading } =
    useStudentMyCalendar({
      start: format(today, "yyyy-MM-dd"),
      end: format(thirtyDaysLater, "yyyy-MM-dd"),
    })

  const slots = slotsData ?? []
  const events = (calendarData ?? []).filter(
    (e) => e.status !== "cancelled" && e.type !== "block",
  )

  return (
    <div className="space-y-6" data-testid="agenda-page">
      {/* Weekly schedule card */}
      <section>
        {slotsLoading ? (
          <LoadingState variant="list" />
        ) : (
          <AgendaCard trainingCount={slots.filter((s) => s.type === "booking").length}>
            {slots.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhum horario fixo configurado.
                </p>
              </div>
            ) : (
              <WeeklyScheduleView slots={slots} />
            )}
          </AgendaCard>
        )}
      </section>

      {/* Upcoming events section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Proximas Aulas</h2>
        {calendarLoading ? (
          <LoadingState variant="list" />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhuma aula agendada"
            description="Nao ha aulas agendadas para os proximos 30 dias."
            data-testid="empty-appointments"
          />
        ) : (
          <div className="space-y-2" data-testid="appointments-list">
            {events.map((event) => (
              <AppointmentListItem
                key={event.id}
                event={event}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
