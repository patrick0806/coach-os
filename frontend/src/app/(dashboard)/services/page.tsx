"use client"

import { Suspense, useState } from "react"
import { Plus, Package } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { LoadingState } from "@/shared/components/loadingState"
import { PageHeader } from "@/shared/components/pageHeader"
import { EmptyState } from "@/shared/components/emptyState"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startServicesTour } from "@/features/onboarding/tours/services.tour"
import { ServicePlanCard } from "@/features/servicePlans/components/servicePlanCard"
import { ServicePlanFormDialog } from "@/features/servicePlans/components/servicePlanFormDialog"
import { DeleteServicePlanDialog } from "@/features/servicePlans/components/deleteServicePlanDialog"
import { useServicePlans } from "@/features/servicePlans/hooks/useServicePlans"
import type { ServicePlanItem } from "@/features/servicePlans/types/servicePlans.types"

function ServicesContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<ServicePlanItem | null>(null)
  const [deletePlan, setDeletePlan] = useState<ServicePlanItem | null>(null)

  const { data: plans, isLoading } = useServicePlans()

  if (isLoading) {
    return <LoadingState variant="card" />
  }

  return (
    <div className="space-y-6">
      <PageTourInitializer page="services" startTour={startServicesTour} />

      <PageHeader
        title="Planos de Serviço"
        description="Gerencie os planos que você oferece aos seus alunos"
        actions={
          <Button onClick={() => setCreateOpen(true)} data-testid="create-plan-button">
            <Plus className="mr-2 size-4" />
            Criar plano
          </Button>
        }
      />

      {plans && plans.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum plano cadastrado"
          description="Crie seu primeiro plano de serviço para oferecer aos seus alunos."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" />
              Criar plano
            </Button>
          }
        />
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          data-testid="service-plans-list"
        >
          {plans?.map((plan) => (
            <ServicePlanCard
              key={plan.id}
              plan={plan}
              onEdit={(p) => setEditPlan(p)}
              onDelete={(p) => setDeletePlan(p)}
            />
          ))}
        </div>
      )}

      <ServicePlanFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {editPlan && (
        <ServicePlanFormDialog
          open={!!editPlan}
          onOpenChange={(open) => !open && setEditPlan(null)}
          plan={editPlan}
        />
      )}

      <DeleteServicePlanDialog
        plan={deletePlan}
        open={!!deletePlan}
        onOpenChange={(open) => !open && setDeletePlan(null)}
      />
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingState variant="page" />}>
      <ServicesContent />
    </Suspense>
  )
}
