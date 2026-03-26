"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/components/pageHeader"
import { WeeklyCalendar } from "@/features/scheduling/components/weeklyCalendar"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startScheduleTour } from "@/features/onboarding/tours/schedule.tour"
import { CreateEventDialog } from "@/features/scheduling/components/createEventDialog"

export default function AgendaPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState<string | undefined>()
  const [defaultStartTime, setDefaultStartTime] = useState<string | undefined>()

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
          <>
            <Button variant="outline" asChild data-testid="configure-availability-btn">
              <Link href="/disponibilidade">
                <Clock className="size-4 mr-2" />
                Configurar disponibilidade
              </Link>
            </Button>
            <Button onClick={handleCreateNew} data-testid="new-appointment-btn">
              <Plus className="size-4 mr-2" />
              Novo agendamento
            </Button>
          </>
        }
      />

      <div data-tour="weekly-calendar">
        <WeeklyCalendar onSlotClick={handleSlotClick} />
      </div>

      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultDate={defaultDate}
        defaultStartTime={defaultStartTime}
      />
    </div>
  )
}
