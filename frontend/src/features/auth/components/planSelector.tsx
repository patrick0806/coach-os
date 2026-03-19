"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import type { Plan } from "@/features/marketing/services/plans.service";
import { formatMoney } from "@/lib/formatMoney";

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlanId: string | null;
  onSelect: (planId: string) => void;
  onContinue: () => void;
}

export function PlanSelector({
  plans,
  selectedPlanId,
  onSelect,
  onContinue,
}: PlanSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Escolha seu plano
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione o plano ideal para o seu negócio
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.id)}
              className={cn(
                "relative w-full rounded-xl border p-4 text-left transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-card"
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  Mais popular
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Até {plan.limitOfStudents} alunos
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {plan.features.slice(0, 3).map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <Check className="h-3 w-3 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold">{formatMoney(plan.price)}</p>
                  <p className="text-xs text-muted-foreground">/mês</p>
                </div>
              </div>

              {isSelected && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button
        variant="premium"
        className="w-full"
        disabled={!selectedPlanId}
        onClick={onContinue}
      >
        Continuar
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Todos os planos incluem 14 dias grátis para testar
      </p>
    </div>
  );
}
