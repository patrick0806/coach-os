"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { PageHeader } from "@/shared/components/pageHeader"
import { AvailabilitySection } from "@/features/scheduling/components/availabilitySection"
import { AvailabilityWizard } from "@/features/scheduling/components/availabilityWizard"

export default function DisponibilidadePage() {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Disponibilidade"
        description="Configure seus horários de atendimento e bloqueie datas indisponíveis."
        actions={
          <Button variant="outline" onClick={() => setWizardOpen(true)} data-testid="open-wizard-btn">
            <Wand2 className="size-4 mr-2" />
            Configurar em lote
          </Button>
        }
      />

      <AvailabilitySection />

      <AvailabilityWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
