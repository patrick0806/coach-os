"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Check, CreditCard, ExternalLink, Zap } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPlanPrice, listPlans } from "@/services/plans.service";
import {
  cancelSubscription,
  createCheckoutSession,
  getMySubscription,
  getSubscriptionUsage,
  openPortal,
  SUBSCRIPTION_STATUS_LABELS,
  upgradeSubscription,
} from "@/services/subscriptions.service";

// ─── Usage progress bar ────────────────────────────────────────────────────────

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const isUnlimited = limit === -1 || limit === 0;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isCritical = !isUnlimited && pct >= 90;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Alunos ativos</span>
        <span className={isCritical ? "font-semibold text-red-600" : ""}>
          {used} / {isUnlimited ? "ilimitado" : limit}
        </span>
      </div>
      {!isUnlimited ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-accent/60">
          <div
            className={`h-full rounded-full transition-all ${isCritical ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

// ─── Plan select for checkout ─────────────────────────────────────────────────

function PlanSelectSection({
  currentPlanId,
  onCheckout,
  isPending,
}: {
  currentPlanId: string | null;
  onCheckout: (planId: string) => void;
  isPending: boolean;
}) {
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: listPlans,
  });

  const available = plans
    .filter((p) => p.id !== currentPlanId)
    .sort((a, b) => a.order - b.order);

  if (available.length === 0) return null;

  return (
    <div className="space-y-3">
      {available.map((plan) => (
        <div
          key={plan.id}
          className={`flex items-center justify-between rounded-3xl border p-4 ${
            plan.highlighted
              ? "border-primary/40 bg-primary/10"
              : "premium-surface border-[color:var(--premium-border)]"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{plan.name}</p>
              {plan.highlighted ? (
                <Badge className="text-xs">Recomendado</Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatPlanPrice(plan.price)}/mês · até{" "}
              {plan.maxStudents === -1 || plan.maxStudents === 0
                ? "ilimitados"
                : plan.maxStudents}{" "}
              alunos
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {plan.benefits.slice(0, 2).map((b, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="size-3 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <Button
            size="sm"
            variant={plan.highlighted ? "premium" : "premium-ghost"}
            className="ml-4 shrink-0"
            disabled={isPending}
            onClick={() => onCheckout(plan.id)}
          >
            <Zap className="mr-1.5 size-3.5" />
            Assinar
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssinaturaPage() {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  const { data: subscription, isLoading: loadingSub } = useQuery({
    queryKey: ["subscription"],
    queryFn: getMySubscription,
  });

  const { data: usage, isLoading: loadingUsage } = useQuery({
    queryKey: ["subscription-usage"],
    queryFn: getSubscriptionUsage,
    enabled: subscription?.status === "active" || subscription?.status === "trialing",
  });

  const { data: allPlans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: listPlans,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => createCheckoutSession(planId),
    onSuccess: ({ checkoutUrl }) => {
      window.location.href = checkoutUrl;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível iniciar o checkout."));
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: (planId: string) => upgradeSubscription(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-usage"] });
      toast.success("Plano atualizado com sucesso.");
      setUpgradingPlanId(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível fazer o upgrade."));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura cancelada. Você mantém o acesso até o fim do período pago.");
      setCancelOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar a assinatura."));
    },
  });

  const portalMutation = useMutation({
    mutationFn: openPortal,
    onSuccess: ({ portalUrl }) => {
      window.open(portalUrl, "_blank", "noopener,noreferrer");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível abrir o portal."));
    },
  });

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isPastDue = subscription?.status === "past_due";
  const isExpired =
    subscription?.status === "cancelled" ||
    subscription?.status === "canceled" ||
    subscription?.status === "inactive" ||
    subscription?.status === "expired";
  const isTrialing = subscription?.status === "trialing";
  const hasStripeSubscription = Boolean(subscription?.stripeSubscriptionId);

  // Plans available for upgrade (higher order than current)
  const currentPlanOrder =
    allPlans.find((p) => p.id === subscription?.planId)?.order ?? -1;
  const upgradePlans = allPlans
    .filter((p) => p.id !== subscription?.planId && p.order > currentPlanOrder)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6">
          <h1 className="premium-heading text-3xl">Assinatura</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie seu plano e faturamento.</p>
        </div>

        {loadingSub ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-accent/60" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert: past due or expired */}
            {(isPastDue || isExpired) ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800">
                    {isPastDue ? "Pagamento pendente" : "Assinatura encerrada"}
                  </p>
                  <p className="mt-0.5 text-amber-700">
                    {isPastDue
                      ? "Regularize seu pagamento para manter o acesso completo."
                      : "Assine um plano para retomar o acesso completo à plataforma."}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Current plan card */}
            <Card variant="glass" className="rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4 text-muted-foreground" />
                  Plano atual
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {subscription?.planName ?? (isTrialing ? "Período gratuito" : "Sem plano")}
                    </p>
                    {subscription?.expiresAt ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {isTrialing
                          ? "Período gratuito até"
                          : isActive
                            ? "Renova em"
                            : "Acesso até"}{" "}
                        {new Date(subscription.expiresAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    ) : null}
                  </div>
                  {subscription?.status ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : isPastDue
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      Sem assinatura
                    </span>
                  )}
                </div>

                {isTrialing && subscription.trialEndsAt ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                    Seu trial termina em{" "}
                    {new Date(subscription.trialEndsAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    . Assine um plano para não perder acesso.
                  </div>
                ) : null}

                {/* Usage bar */}
                {isActive && !loadingUsage && usage ? (
                  <UsageBar used={usage.studentsUsed} limit={usage.studentsLimit} />
                ) : null}

                {/* Actions for active subscribers */}
                {isActive && hasStripeSubscription ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="premium-ghost"
                      size="sm"
                      className="gap-1.5"
                      disabled={portalMutation.isPending}
                      onClick={() => portalMutation.mutate()}
                    >
                      <ExternalLink className="size-3.5" />
                      Gerenciar pagamentos
                    </Button>
                    <Button
                      variant="premium-ghost"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancelar assinatura
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Upgrade section */}
            {isActive && hasStripeSubscription && upgradePlans.length > 0 ? (
              <Card variant="glass" className="rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="size-4 text-muted-foreground" />
                    Fazer upgrade
                  </CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-3 pt-4">
                  {upgradePlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`flex items-center justify-between rounded-3xl border p-4 ${
                        plan.highlighted
                          ? "border-primary/40 bg-primary/10"
                          : "premium-surface border-[color:var(--premium-border)]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{plan.name}</p>
                          {plan.highlighted ? (
                            <Badge className="text-xs">Recomendado</Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatPlanPrice(plan.price)}/mês · até{" "}
                          {plan.maxStudents === -1 || plan.maxStudents === 0
                            ? "ilimitados"
                            : plan.maxStudents}{" "}
                          alunos
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={plan.highlighted ? "premium" : "premium-ghost"}
                        className="ml-4 shrink-0"
                        disabled={upgradeMutation.isPending}
                        onClick={() => setUpgradingPlanId(plan.id)}
                      >
                        Fazer upgrade
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {/* No subscription — plan selection */}
            {!hasStripeSubscription ? (
              <Card variant="glass" className="rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Escolha um plano</CardTitle>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <PlanSelectSection
                    currentPlanId={isTrialing ? null : (subscription?.planId ?? null)}
                    onCheckout={(planId) => checkoutMutation.mutate(planId)}
                    isPending={checkoutMutation.isPending}
                  />
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <AlertDialog open={cancelOpen} onOpenChange={(open) => !open && setCancelOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Sua assinatura será cancelada ao fim do período já pago. Você manterá acesso
              completo até lá. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade confirmation */}
      <AlertDialog
        open={Boolean(upgradingPlanId)}
        onOpenChange={(open) => !open && setUpgradingPlanId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar upgrade</AlertDialogTitle>
            <AlertDialogDescription>
              O upgrade será aplicado imediatamente. A diferença proporcional será cobrada no
              seu método de pagamento cadastrado. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={upgradeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={upgradeMutation.isPending}
              onClick={() => upgradingPlanId && upgradeMutation.mutate(upgradingPlanId)}
            >
              {upgradeMutation.isPending ? "Atualizando..." : "Confirmar upgrade"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
