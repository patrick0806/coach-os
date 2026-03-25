"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { AlertCircle, RefreshCw } from "lucide-react"

import { api } from "@/lib/axios"
import { authStore } from "@/stores/authStore"
import { useSubscription } from "@/features/billing/hooks/useSubscription"
import { subscriptionService } from "@/features/billing/services/subscription.service"
import type { SubscriptionDetails } from "@/features/billing/services/subscription.service"
import { SubscriptionStatusCard } from "@/features/billing/components/subscriptionStatusCard"
import { PlanCard } from "@/features/billing/components/planCard"
import { ChangePlanDialog } from "@/features/billing/components/changePlanDialog"
import { CancelSubscriptionDialog } from "@/features/billing/components/cancelSubscriptionDialog"
import { CheckoutResultDialog } from "@/features/billing/components/checkoutResultDialog"
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

// Builds a minimal SubscriptionDetails from the auth cookie as a fallback when the API fails.
// This allows the user to still see their subscription status and use the Stripe buttons.
function buildFallbackSubscription(plans: PlanListItem[] | undefined): SubscriptionDetails | null {
  const authSub = authStore.getUser()?.subscription
  if (!authSub) return null

  const matchedPlan = plans?.find((p) => p.id === authSub.planId) ?? null

  return {
    plan: matchedPlan
      ? {
          id: matchedPlan.id,
          name: matchedPlan.name,
          price: matchedPlan.price,
          maxStudents: matchedPlan.maxStudents,
          highlighted: matchedPlan.highlighted,
        }
      : null,
    accessStatus: authSub.accessStatus ?? "trialing",
    subscriptionStatus: authSub.subscriptionStatus,
    trialEndsAt: authSub.trialEndsAt,
    subscriptionExpiresAt: authSub.subscriptionExpiresAt,
    studentsCount: 0,
    studentsLimit: matchedPlan?.maxStudents ?? 0,
  }
}

export default function AssinaturaPage() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedPlanName, setSelectedPlanName] = useState<string>("")
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState<"success" | "cancelled" | null>(null)

  useEffect(() => {
    const param = searchParams.get("checkout")
    if (param === "success" || param === "cancelled") {
      if (param === "success") {
        queryClient.invalidateQueries({ queryKey: ["subscription"] })
      }
      setCheckoutResult(param)
      router.replace("/assinatura")
    }
  }, [searchParams, queryClient, router])

  const {
    data: subscriptionData,
    isLoading: loadingSubscription,
    isError: subscriptionError,
    refetch: refetchSubscription,
  } = useSubscription()

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans-list"],
    queryFn: async () => {
      const response = await api.get<PlanListItem[]>("/plans")
      return response.data
    },
  })

  // Use API data when available, fall back to auth cookie data if API fails
  const subscription: SubscriptionDetails | undefined | null =
    subscriptionData ?? (subscriptionError ? buildFallbackSubscription(plans) : undefined)

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
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Não foi possível iniciar o checkout")
        : "Não foi possível iniciar o checkout"
      toast.error(message)
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

  // Only show cancel for users with an active paid Stripe subscription
  const canCancel =
    subscription &&
    (subscription.subscriptionStatus === "active") &&
    subscription.accessStatus !== "expired" &&
    subscription.accessStatus !== "suspended"

  // Determine if user is trialing (for plan card button display)
  const isTrialing =
    subscription?.subscriptionStatus === "trialing" ||
    (!subscription?.subscriptionStatus && subscription?.accessStatus === "trialing")

  if (loadingSubscription && !plans) {
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

      {subscriptionError && !subscription && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>Não foi possível carregar os dados da assinatura.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSubscription()}
            className="shrink-0"
          >
            <RefreshCw className="mr-2 size-3" />
            Tentar novamente
          </Button>
        </div>
      )}

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
                isTrialing={isTrialing}
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

      {checkoutResult && (
        <CheckoutResultDialog
          open={true}
          onOpenChange={(open) => { if (!open) setCheckoutResult(null) }}
          variant={checkoutResult}
        />
      )}
    </div>
  )
}
