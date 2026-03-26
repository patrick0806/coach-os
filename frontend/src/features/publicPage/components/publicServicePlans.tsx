import { MessageCircle } from "lucide-react"
import type { PublicServicePlan } from "@/features/publicPage/types/publicPage.types"
import { formatMoney } from "@/lib/formatMoney"

interface PublicServicePlansProps {
  plans: PublicServicePlan[]
  phoneNumber: string | null
}

export function PublicServicePlans({ plans, phoneNumber }: PublicServicePlansProps) {
  if (plans.length === 0) return null

  function buildWhatsappUrl(planName: string): string {
    const phone = (phoneNumber ?? "").replace(/\D/g, "")
    const text = encodeURIComponent(`Olá! Tenho interesse no plano ${planName}.`)
    return `https://wa.me/${phone}?text=${text}`
  }

  return (
    <section id="planos" className="bg-muted/40 px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Planos e Serviços</h2>
          <p className="mt-2 text-muted-foreground">Escolha o plano ideal para você</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-xl border bg-background p-6 shadow-sm"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
                  >
                    {plan.attendanceType === "online" ? "Online" : "Presencial"}
                  </span>
                </div>

                <p className="text-2xl font-bold" style={{ color: "var(--brand-color, hsl(var(--primary)))" }}>
                  {formatMoney(Number(plan.price))}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>

                {plan.sessionsPerWeek && (
                  <p className="text-sm text-muted-foreground">
                    {plan.sessionsPerWeek}x por semana
                  </p>
                )}

                {plan.durationMinutes && (
                  <p className="text-sm text-muted-foreground">
                    {plan.durationMinutes} minutos por sessão
                  </p>
                )}

                {plan.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                )}
              </div>

              {phoneNumber && (
                <a
                  href={buildWhatsappUrl(plan.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle className="size-4" />
                  Contratar via WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
