import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/formatMoney";
import type { Plan } from "@/services/plans.service";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const formattedPrice = formatMoney(plan.price);

  return (
    <div
      data-slot="plan-card"
      className={cn(
        "relative flex flex-col rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm",
        plan.highlighted &&
          "border-primary/40 bg-card/60 ring-1 ring-primary/20 shadow-xl shadow-primary/10"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Mais popular
        </span>
      )}

      <h3 className="text-lg font-bold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Até {plan.limitOfStudents} alunos
      </p>

      <div className="mt-4">
        <span className="text-4xl font-extrabold tracking-tight">{formattedPrice}</span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check className="size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={`/cadastro?plan=${plan.id}`}
        className={cn(
          "mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-colors",
          plan.highlighted
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border bg-card text-foreground hover:bg-muted"
        )}
      >
        {plan.hasTrial ? "Começar 30 dias grátis" : "Começar agora"}
      </Link>
    </div>
  );
}
