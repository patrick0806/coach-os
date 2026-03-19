"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

import { api } from "@/lib/axios"
import { useSubscription } from "@/features/billing/hooks/useSubscription"
import { subscriptionService } from "@/features/billing/services/subscription.service"
import { SubscriptionStatusCard } from "@/features/billing/components/subscriptionStatusCard"
import { PlanCard } from "@/features/billing/components/planCard"
import { ChangePlanDialog } from "@/features/billing/components/changePlanDialog"
import { CancelSubscriptionDialog } from "@/features/billing/components/cancelSubscriptionDialog"
import { LoadingState } from "@/shared/components/loadingState"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"

interface PlanListItem {
  id: string
  name: string
  price: string
  maxStudents: number
  highlighted: boolean
  benefits?: string[] | null
}

export default function AssinaturaPage() {
  const queryClient = useQueryClient()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedPlanName, setSelectedPlanName] = useState<string>("")
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const { data: subscription, isLoading: loadingSubscription } = useSubscription()

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans-list"],
    queryFn: async () => {
      const response = await api.get<PlanListItem[]>("/plans")
      return response.data
    },
  })

  const changePlanMutation = useMutation({
    mutationFn: (planId: string) => subscriptionService.changePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
      toast.success("Plano alterado com sucesso!")
      setChangePlanDialogOpen(false)
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao trocar plano")
        : "Erro ao trocar plano"
      toast.error(message)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] })
      toast.success("Assinatura cancelada. Acesso mantido até o fim do período.")
      setCancelDialogOpen(false)
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Erro ao cancelar assinatura")
        : "Erro ao cancelar assinatura"
      toast.error(message)
    },
  })

  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false)

  async function handleOpenPortal() {
    setIsOpeningPortal(true)
    try {
      const url = await subscriptionService.getPortalUrl()
      window.location.href = url
    } catch {
      toast.error("Não foi possível abrir o portal de pagamento")
    } finally {
      setIsOpeningPortal(false)
    }
  }

  async function handleCheckout() {
    setIsOpeningCheckout(true)
    try {
      const url = await subscriptionService.getCheckoutUrl()
      window.location.href = url
    } catch {
      toast.error("Não foi possível iniciar o checkout")
    } finally {
      setIsOpeningCheckout(false)
    }
  }

  function handleSelectPlan(planId: string, planName: string) {
    setSelectedPlanId(planId)
    setSelectedPlanName(planName)
    setChangePlanDialogOpen(true)
  }

  function handleConfirmChangePlan() {
    if (selectedPlanId) {
      changePlanMutation.mutate(selectedPlanId)
    }
  }

  const canCancel =
    subscription &&
    subscription.accessStatus === "active" &&
    subscription.subscriptionStatus !== "canceled"

  if (loadingSubscription) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoadingState variant="page" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie seu plano e dados de cobrança</p>
      </div>

      {subscription && (
        <SubscriptionStatusCard
          subscription={subscription}
          onOpenPortal={handleOpenPortal}
          isOpeningPortal={isOpeningPortal}
          onCheckout={handleCheckout}
          isOpeningCheckout={isOpeningCheckout}
        />
      )}

      <Separator />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Planos disponíveis</h2>
        {loadingPlans ? (
          <div className="flex h-32 items-center justify-center">
            <LoadingState variant="card" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {(plans ?? []).map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                price={plan.price}
                maxStudents={plan.maxStudents}
                highlighted={plan.highlighted}
                benefits={plan.benefits}
                isCurrentPlan={plan.id === subscription?.plan?.id}
                isTrialing={subscription?.accessStatus === "trialing"}
                onSelect={(id) => handleSelectPlan(id, plan.name)}
                isLoading={changePlanMutation.isPending && selectedPlanId === plan.id}
              />
            ))}
          </div>
        )}
      </div>

      {canCancel && (
        <>
          <Separator />
          <div>
            <h2 className="mb-1 text-lg font-semibold">Cancelar assinatura</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Ao cancelar, você mantém o acesso até o final do período pago.
            </p>
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
              disabled={cancelMutation.isPending}
            >
              Cancelar assinatura
            </Button>
          </div>
        </>
      )}

      <ChangePlanDialog
        open={changePlanDialogOpen}
        onOpenChange={setChangePlanDialogOpen}
        planName={selectedPlanName}
        onConfirm={handleConfirmChangePlan}
        isLoading={changePlanMutation.isPending}
      />

      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        subscriptionExpiresAt={subscription?.subscriptionExpiresAt ?? null}
        onConfirm={() => cancelMutation.mutate()}
        isLoading={cancelMutation.isPending}
      />
    </div>
  )
}
