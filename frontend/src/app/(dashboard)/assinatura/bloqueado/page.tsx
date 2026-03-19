"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { AlertTriangle, CreditCard, LogOut } from "lucide-react"
import { Suspense } from "react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { authStore } from "@/stores/authStore"
import { subscriptionService } from "@/features/billing/services/subscription.service"

const REASON_MESSAGES: Record<string, { title: string; description: string; ctaLabel: string; ctaAction: "checkout" | "portal" | "href"; ctaHref?: string }> = {
  trial: {
    title: "Seu período de teste encerrou",
    description: "O trial gratuito de 7 dias chegou ao fim. Assine agora para continuar usando o Coach OS.",
    ctaLabel: "Assinar agora",
    ctaAction: "checkout",
  },
  payment: {
    title: "Pagamento em atraso",
    description: "Houve uma falha no pagamento da sua assinatura. Regularize para continuar usando a plataforma.",
    ctaLabel: "Regularizar pagamento",
    ctaAction: "portal",
  },
  inactive: {
    title: "Assinatura inativa",
    description: "Sua assinatura está inativa ou cancelada. Assine agora para reativar o acesso.",
    ctaLabel: "Assinar agora",
    ctaAction: "checkout",
  },
}

function BlockedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason") ?? "inactive"
  const info = REASON_MESSAGES[reason] ?? REASON_MESSAGES.inactive

  function handleLogout() {
    authStore.clear()
    router.push("/login")
  }

  async function handleCta() {
    try {
      if (info.ctaAction === "checkout") {
        const url = await subscriptionService.getCheckoutUrl()
        window.location.href = url
      } else if (info.ctaAction === "portal") {
        const url = await subscriptionService.getPortalUrl()
        window.location.href = url
      } else if (info.ctaHref) {
        router.push(info.ctaHref)
      }
    } catch {
      router.push("/assinatura")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-7 text-destructive" />
          </div>
          <CardTitle className="text-xl">{info.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>{info.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" onClick={handleCta}>
            <CreditCard className="mr-2 size-4" />
            {info.ctaLabel}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function SubscriptionBlockedPage() {
  return (
    <Suspense>
      <BlockedContent />
    </Suspense>
  )
}
