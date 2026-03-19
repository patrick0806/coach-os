"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CreditCard, Users } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import type { SubscriptionDetails } from "@/features/billing/services/subscription.service"

interface SubscriptionStatusCardProps {
  subscription: SubscriptionDetails
  onOpenPortal: () => void
  isOpeningPortal: boolean
  onCheckout: () => void
  isOpeningCheckout: boolean
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  trialing: { label: "Trial", variant: "secondary" },
  past_due: { label: "Pagamento em atraso", variant: "destructive" },
  expired: { label: "Expirado", variant: "destructive" },
  suspended: { label: "Suspenso", variant: "destructive" },
  canceled: { label: "Cancelado", variant: "outline" },
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return format(new Date(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function SubscriptionStatusCard({
  subscription,
  onOpenPortal,
  isOpeningPortal,
  onCheckout,
  isOpeningCheckout,
}: SubscriptionStatusCardProps) {
  const isTrialing = subscription.accessStatus === "trialing"
  const statusInfo = STATUS_LABELS[subscription.accessStatus] ?? { label: subscription.accessStatus, variant: "outline" as const }
  const trialDate = formatDate(subscription.trialEndsAt)
  const expiresDate = formatDate(subscription.subscriptionExpiresAt)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Assinatura atual</CardTitle>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{subscription.plan?.name ?? "Sem plano"}</p>
            {subscription.plan && (
              <p className="text-sm text-muted-foreground">
                R$ {Number(subscription.plan.price).toFixed(2).replace(".", ",")}/mês
              </p>
            )}
          </div>
        </div>

        {trialDate && subscription.accessStatus === "trialing" && (
          <p className="text-sm text-muted-foreground">
            Trial até <span className="font-medium text-foreground">{trialDate}</span>
          </p>
        )}

        {expiresDate && subscription.accessStatus !== "trialing" && (
          <p className="text-sm text-muted-foreground">
            {subscription.subscriptionStatus === "canceled" ? "Acesso até" : "Renova em"}{" "}
            <span className="font-medium text-foreground">{expiresDate}</span>
          </p>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">{subscription.studentsCount}</span>
            {" de "}
            <span className="font-medium">{subscription.studentsLimit}</span>
            {" alunos utilizados"}
          </span>
        </div>

        {isTrialing ? (
          <Button
            className="w-full"
            onClick={onCheckout}
            disabled={isOpeningCheckout}
          >
            <CreditCard className="mr-2 size-4" />
            {isOpeningCheckout ? "Redirecionando..." : "Assinar agora"}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={onOpenPortal}
            disabled={isOpeningPortal}
          >
            <CreditCard className="mr-2 size-4" />
            {isOpeningPortal ? "Abrindo portal..." : "Gerenciar pagamento"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
