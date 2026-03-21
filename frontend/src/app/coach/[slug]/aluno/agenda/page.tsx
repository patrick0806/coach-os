"use client"

import { addDays, format } from "date-fns"
import { CalendarDays } from "lucide-react"

import { useStudentTrainingSchedules } from "@/features/studentPortal/hooks/useStudentTrainingSchedules"
import { useStudentMyAppointments } from "@/features/studentPortal/hooks/useStudentMyAppointments"
import { AgendaCard } from "@/features/studentPortal/components/agendaCard"
import { WeeklyScheduleView } from "@/features/studentPortal/components/weeklyScheduleView"
import { AppointmentListItem } from "@/features/studentPortal/components/appointmentListItem"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"

export default function StudentAgendaPage() {
  const today = new Date()
  const thirtyDaysLater = addDays(today, 30)

  const { data: schedulesData, isLoading: schedulesLoading } =
    useStudentTrainingSchedules()

  const { data: appointmentsData, isLoading: appointmentsLoading } =
    useStudentMyAppointments({
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(thirtyDaysLater, "yyyy-MM-dd"),
      page: 0,
      size: 20,
    })

  const schedules = schedulesData ?? []
  const appointments = appointmentsData?.content ?? []

  return (
    <div className="space-y-6" data-testid="agenda-page">
      {/* Weekly schedule card */}
      <section>
        {schedulesLoading ? (
          <LoadingState variant="list" />
        ) : (
          <AgendaCard trainingCount={schedules.length}>
            {schedules.length === 0 ? (
              <div className="px-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhum horário fixo configurado.
                </p>
              </div>
            ) : (
              <WeeklyScheduleView schedules={schedules} />
            )}
          </AgendaCard>
        )}
      </section>

      {/* Upcoming appointments section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Próximas Aulas</h2>
        {appointmentsLoading ? (
          <LoadingState variant="list" />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhuma aula agendada"
            description="Não há aulas agendadas para os próximos 30 dias."
            data-testid="empty-appointments"
          />
        ) : (
          <div className="space-y-2" data-testid="appointments-list">
            {appointments.map((appointment) => (
              <AppointmentListItem
                key={appointment.id}
                appointment={appointment}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
