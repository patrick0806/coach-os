"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getMeWorkoutPlans } from "@/services/workout-plans.service";

interface AlunoPainelPageProps {
  params: Promise<{ "slug-personal": string }>;
}

export default function AlunoPainelPage({ params }: AlunoPainelPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams["slug-personal"];

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["me-workout-plans"],
    queryFn: getMeWorkoutPlans,
  });

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Painel do Aluno</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bem-vindo de volta!</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-medium">
            <Dumbbell className="size-4 text-muted-foreground" />
            Meus treinos
          </h2>
          <Link
            href={`/${slug}/alunos/treinos`}
            className="text-sm text-primary hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-accent" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum treino atribuído ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {plans.slice(0, 3).map((plan) => (
              <Link
                key={plan.id}
                href={`/${slug}/alunos/treinos/${plan.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  {plan.description ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>
                  ) : null}
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
