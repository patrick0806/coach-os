"use client"

import { useState } from "react"
import { Plus, Bell } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/components/pageHeader"
import { WeeklyCalendar } from "@/features/scheduling/components/weeklyCalendar"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startScheduleTour } from "@/features/onboarding/tours/schedule.tour"
import { CreateAppointmentDialog } from "@/features/scheduling/components/createAppointmentDialog"
import { PendingRequestsSheet } from "@/features/scheduling/components/pendingRequestsSheet"
import { useAppointmentRequests } from "@/features/scheduling/hooks/useAppointmentRequests"
import { useAvailabilityRules } from "@/features/scheduling/hooks/useAvailabilityRules"
import { useAvailabilityExceptions } from "@/features/scheduling/hooks/useAvailabilityExceptions"

export default function AgendaPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [requestsOpen, setRequestsOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState<string | undefined>()
  const [defaultStartTime, setDefaultStartTime] = useState<string | undefined>()

  const { data: pendingRequests } = useAppointmentRequests({ status: "pending", size: 1 })
  const pendingCount = pendingRequests?.totalElements ?? 0

  const { data: availabilityRules = [] } = useAvailabilityRules()
  const { data: availabilityExceptions = [] } = useAvailabilityExceptions()
  const exceptionDates = availabilityExceptions.map((e) => e.date)

  function handleSlotClick(date: string, time: string) {
    setDefaultDate(date)
    setDefaultStartTime(time)
    setCreateOpen(true)
  }

  function handleCreateNew() {
    setDefaultDate(undefined)
    setDefaultStartTime(undefined)
    setCreateOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      <PageTourInitializer page="schedule" startTour={startScheduleTour} />

      <PageHeader
        title="Agenda"
        description="Visualize e gerencie seus agendamentos da semana."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRequestsOpen(true)} data-tour="pending-requests-btn">
              <Bell className="size-4 mr-2" />
              Solicitações
              {pendingCount > 0 && (
                <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Button>
            <Button onClick={handleCreateNew} data-testid="new-appointment-btn">
              <Plus className="size-4 mr-2" />
              Novo agendamento
            </Button>
          </div>
        }
      />

      <div data-tour="weekly-calendar">
        <WeeklyCalendar
          onSlotClick={handleSlotClick}
          availabilityRules={availabilityRules}
          exceptionDates={exceptionDates}
        />
      </div>

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultDate={defaultDate}
        defaultStartTime={defaultStartTime}
      />

      <PendingRequestsSheet open={requestsOpen} onOpenChange={setRequestsOpen} />
    </div>
  )
}
