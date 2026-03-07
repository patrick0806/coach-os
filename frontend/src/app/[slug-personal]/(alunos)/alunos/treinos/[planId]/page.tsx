"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MUSCLE_GROUP_COLORS, MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/services/exercises.service";
import { getMeWorkoutPlan } from "@/services/workout-plans.service";

interface AlunoTreinoDetailPageProps {
  params: Promise<{ "slug-personal": string; planId: string }>;
}

export default function AlunoTreinoDetailPage({ params }: AlunoTreinoDetailPageProps) {
  const resolvedParams = use(params);
  const { "slug-personal": slug, planId } = resolvedParams;

  const { data: plan, isLoading } = useQuery({
    queryKey: ["me-workout-plan", planId],
    queryFn: () => getMeWorkoutPlan(planId),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-accent" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-muted-foreground">
        <p>Treino não encontrado.</p>
        <Link
          href={`/${slug}/alunos/treinos`}
          className="text-sm text-primary hover:underline"
        >
          Voltar para treinos
        </Link>
      </div>
    );
  }

  const sortedExercises = [...plan.exercises].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <Link
        href={`/${slug}/alunos/treinos`}
        className="-ml-1 mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Meus Treinos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{plan.name}</h1>
        {plan.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        ) : null}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Exercícios{" "}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              ({sortedExercises.length})
            </span>
          </CardTitle>
        </CardHeader>

        <Separator className="bg-border/50" />

        <CardContent className="pt-4">
          {sortedExercises.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum exercício neste plano.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedExercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{ex.exerciseName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          MUSCLE_GROUP_COLORS[ex.muscleGroup as MuscleGroup] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {MUSCLE_GROUP_LABELS[ex.muscleGroup as MuscleGroup] ?? ex.muscleGroup}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ex.sets} séries × {ex.repetitions} reps
                      {ex.load ? (
                        <span className="ml-2 font-medium text-foreground">— {ex.load}</span>
                      ) : null}
                    </p>
                    {ex.notes ? (
                      <p className="mt-1 text-xs italic text-muted-foreground">{ex.notes}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
