"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WorkoutPlan } from "@/services/workout-plans.service";

interface PlansListProps {
  plans: WorkoutPlan[];
  isLoading: boolean;
  onCreateClick: () => void;
}

export function PlansList({ plans, isLoading, onCreateClick }: PlansListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center text-gray-400">
          <Dumbbell className="mb-3 size-10 opacity-30" />
          <p>Você ainda não tem planos de treino.</p>
          <Button variant="outline" className="mt-4" onClick={onCreateClick}>
            Criar primeiro plano
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <button
          key={plan.id}
          onClick={() => router.push(`/painel/treinos/${plan.id}`)}
          className="flex w-full items-center justify-between rounded-xl border bg-white p-4 text-left transition-colors hover:bg-gray-50"
        >
          <div className="min-w-0">
            <p className="font-medium text-gray-900">{plan.name}</p>
            {plan.description ? (
              <p className="mt-0.5 truncate text-sm text-gray-500">{plan.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-gray-400">
              Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <ChevronRight className="ml-4 size-5 shrink-0 text-gray-400" />
        </button>
      ))}
    </div>
  );
}
