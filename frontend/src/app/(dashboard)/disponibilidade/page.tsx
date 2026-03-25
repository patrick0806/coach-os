"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/components/pageHeader"
import { WorkingHoursSection } from "@/features/scheduling/components/workingHoursSection"
import { WorkingHoursWizard } from "@/features/scheduling/components/workingHoursWizard"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startAvailabilityTour } from "@/features/onboarding/tours/availability.tour"

export default function DisponibilidadePage() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageTourInitializer page="availability" startTour={startAvailabilityTour} />

      <PageHeader
        title="Disponibilidade"
        description="Configure seus horarios de atendimento."
        actions={
          <Button variant="outline" onClick={() => setWizardOpen(true)} data-testid="open-wizard-btn">
            <Wand2 className="size-4 mr-2" />
            Configurar em lote
          </Button>
        }
      />

      <WorkingHoursSection />

      <WorkingHoursWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
