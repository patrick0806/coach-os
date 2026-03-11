"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Dumbbell, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getMeWorkoutPlans } from "@/services/workout-plans.service";

interface AlunoTreinosPageProps {
  params: Promise<{ "slug-personal": string }>;
}

export default function AlunoTreinosPage({ params }: AlunoTreinosPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams["slug-personal"];

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["me-workout-plans"],
    queryFn: getMeWorkoutPlans,
  });

  return (
    <div className="mx-auto max-w-3xl p-4 pb-28 sm:p-8">
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--premium-border)] bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Biblioteca ativa
        </span>
        <h1 className="premium-heading text-3xl">Meus Treinos</h1>
        <p className="premium-subheading">
          Planos de treino atribuídos pelo seu personal.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-accent/60" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card variant="glass" className="rounded-3xl">
          <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Dumbbell className="mb-3 size-10 opacity-30" />
            <p>Você ainda não tem planos de treino atribuídos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/${slug}/alunos/treinos/${plan.id}`}
              className="premium-surface flex items-center justify-between rounded-3xl px-4 py-4 transition-all hover:scale-[1.01] hover:bg-accent/20"
            >
              <div className="min-w-0">
                <p className="font-medium">{plan.name}</p>
                {plan.description ? (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <ChevronRight className="ml-4 size-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
