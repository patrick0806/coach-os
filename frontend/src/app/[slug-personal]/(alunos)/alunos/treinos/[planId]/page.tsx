"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Minus,
  Pause,
  Play,
  Zap,
} from "lucide-react";

import { ExerciseMedia } from "@/components/shared/exercise-media";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MUSCLE_GROUP_COLORS,
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from "@/services/exercises.service";
import { getMeWorkoutPlan } from "@/services/workout-plans.service";

interface AlunoTreinoDetailPageProps {
  params: Promise<{ "slug-personal": string; planId: string }>;
}

interface ExerciseProgressState {
  completedSets: number;
  load: number;
  repetitions: number;
}

function parseLoad(load: string | null): number {
  if (!load) return 0;
  const value = Number.parseFloat(load.replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

function formatLoad(load: number): string {
  if (load <= 0) return "Livre";
  return `${load.toFixed(load % 1 === 0 ? 0 : 1)} kg`;
}

function formatTimer(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ExerciseStepper({
  label,
  value,
  decrement,
  increment,
  helper,
}: {
  label: string;
  value: string;
  decrement: () => void;
  increment: () => void;
  helper: string;
}) {
  return (
    <Card variant="glass" className="rounded-3xl">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="premium-heading text-sm">{label}</p>
            <p className="premium-subheading mt-1">{helper}</p>
          </div>
          <span className="premium-heading text-2xl">{value}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="premium-ghost"
            className="h-14 rounded-2xl"
            onClick={decrement}
          >
            <Minus className="size-5" />
          </Button>
          <Button
            type="button"
            variant="premium"
            className="h-14 rounded-2xl"
            onClick={increment}
          >
            <ChevronRight className="size-5 rotate-90" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AlunoTreinoDetailPage({ params }: AlunoTreinoDetailPageProps) {
  const resolvedParams = use(params);
  const { "slug-personal": slug, planId } = resolvedParams;
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgressState>>({});
  const [restSeconds, setRestSeconds] = useState(0);
  const [restActive, setRestActive] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["me-workout-plan", planId],
    queryFn: () => getMeWorkoutPlan(planId),
  });

  const sortedExercises = useMemo(
    () => [...(plan?.exercises ?? [])].sort((a, b) => a.order - b.order),
    [plan?.exercises],
  );

  useEffect(() => {
    if (!restActive || restSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRestSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [restActive, restSeconds]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-4 sm:p-6">
        <Skeleton className="h-10 rounded-2xl bg-accent/60" />
        <Skeleton className="aspect-video rounded-3xl bg-accent/60" />
        <Skeleton className="h-40 rounded-3xl bg-accent/60" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32 rounded-3xl bg-accent/60" />
          <Skeleton className="h-32 rounded-3xl bg-accent/60" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 text-muted-foreground">
        <p>Treino não encontrado.</p>
        <Link href={`/${slug}/alunos/treinos`} className="text-sm text-primary hover:underline">
          Voltar para treinos
        </Link>
      </div>
    );
  }

  if (sortedExercises.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 text-muted-foreground">
        <p>Este treino ainda não possui exercícios.</p>
        <Link href={`/${slug}/alunos/treinos`} className="text-sm text-primary hover:underline">
          Voltar para treinos
        </Link>
      </div>
    );
  }

  const safeExerciseIndex = Math.min(currentExerciseIndex, sortedExercises.length - 1);
  const currentExercise = sortedExercises[safeExerciseIndex];
  const mergedExerciseProgress = sortedExercises.reduce<Record<string, ExerciseProgressState>>(
    (accumulator, exercise) => {
      accumulator[exercise.id] = exerciseProgress[exercise.id] ?? {
        completedSets: 0,
        load: parseLoad(exercise.load),
        repetitions: exercise.repetitions,
      };
      return accumulator;
    },
    {},
  );
  const currentProgress = mergedExerciseProgress[currentExercise.id] ?? {
    completedSets: 0,
    load: parseLoad(currentExercise.load),
    repetitions: currentExercise.repetitions,
  };
  const totalSets = sortedExercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const completedSets = Object.values(mergedExerciseProgress).reduce(
    (sum, exercise) => sum + exercise.completedSets,
    0,
  );
  const progressPercent = Math.round((completedSets / Math.max(totalSets, 1)) * 100);
  const currentSetNumber = Math.min(currentProgress.completedSets + 1, currentExercise.sets);
  const isExerciseCompleted = currentProgress.completedSets >= currentExercise.sets;
  const isRestRunning = restActive && restSeconds > 0;
  const restToneClass =
    restSeconds === 0
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
      : "border-white/10 bg-white/10 text-white";

  function updateExerciseProgress(
    exerciseId: string,
    updater: (current: ExerciseProgressState) => ExerciseProgressState,
  ) {
    setExerciseProgress((currentState) => ({
      ...currentState,
      [exerciseId]: updater(
        currentState[exerciseId] ?? {
          completedSets: 0,
          load: parseLoad(currentExercise.load),
          repetitions: currentExercise.repetitions,
        },
      ),
    }));
  }

  function handleCompleteSet() {
    if (isExerciseCompleted) return;

    updateExerciseProgress(currentExercise.id, (state) => ({
      ...state,
      completedSets: Math.min(state.completedSets + 1, currentExercise.sets),
    }));
    setRestSeconds(90);
    setRestActive(true);
  }

  function goToPreviousExercise() {
    setCurrentExerciseIndex((current) => Math.max(current - 1, 0));
  }

  function goToNextExercise() {
    setCurrentExerciseIndex((current) => Math.min(current + 1, sortedExercises.length - 1));
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/${slug}/alunos/treinos`}
            className="premium-glass inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-foreground"
          >
            <ArrowLeft className="size-4" />
            Sair do treino
          </Link>
          <div className="premium-glass rounded-2xl px-4 py-3 text-right">
            <p className="premium-subheading">Progresso total</p>
            <p className="premium-heading text-lg">{progressPercent}% concluído</p>
          </div>
        </div>

        <Card variant="premium" className="premium-highlight rounded-[32px] text-primary-foreground">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">
                  Exercício {safeExerciseIndex + 1} de {sortedExercises.length}
                </p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {currentExercise.exerciseName}
                </h1>
              </div>
              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-right",
                  restToneClass,
                )}
              >
                <p className="text-xs uppercase tracking-[0.2em]">Descanso</p>
                <div className="mt-1 flex items-center gap-2">
                  <Clock3 className="size-4" />
                  <span className="text-2xl font-bold">{formatTimer(restSeconds)}</span>
                </div>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white/90 transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Série atual</p>
                <p className="mt-1 text-lg font-semibold">
                  {currentSetNumber}/{currentExercise.sets}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Última carga</p>
                <p className="mt-1 text-lg font-semibold">{currentExercise.load ?? "Livre"}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Meta</p>
                <p className="mt-1 text-lg font-semibold">{currentExercise.sets} x {currentExercise.repetitions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[32px] border border-[color:var(--premium-border)] bg-black shadow-[var(--premium-shadow-strong)]">
              <ExerciseMedia
                exercisedbGifUrl={currentExercise.exercisedbGifUrl}
                youtubeUrl={currentExercise.youtubeUrl}
                exerciseName={currentExercise.exerciseName}
              />
            </div>

            <Card variant="glass" className="rounded-[32px]">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      MUSCLE_GROUP_COLORS[currentExercise.muscleGroup as MuscleGroup] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {MUSCLE_GROUP_LABELS[currentExercise.muscleGroup as MuscleGroup] ??
                      currentExercise.muscleGroup}
                  </span>
                  <span className="rounded-full border border-[color:var(--premium-border)] px-3 py-1 text-xs font-medium text-muted-foreground">
                    Histórico: {currentExercise.load ?? "Livre"} · {currentExercise.repetitions} reps
                  </span>
                </div>

                {currentExercise.notes ? (
                  <div className="premium-surface rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                    {currentExercise.notes}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <ExerciseStepper
                    label="Carga"
                    value={formatLoad(currentProgress.load)}
                    helper="Ajuste fino para a série atual"
                    decrement={() =>
                      updateExerciseProgress(currentExercise.id, (state) => ({
                        ...state,
                        load: Math.max(0, Number((state.load - 1).toFixed(1))),
                      }))
                    }
                    increment={() =>
                      updateExerciseProgress(currentExercise.id, (state) => ({
                        ...state,
                        load: Number((state.load + 1).toFixed(1)),
                      }))
                    }
                  />
                  <ExerciseStepper
                    label="Repetições"
                    value={`${currentProgress.repetitions} reps`}
                    helper="Corrija conforme sua execução real"
                    decrement={() =>
                      updateExerciseProgress(currentExercise.id, (state) => ({
                        ...state,
                        repetitions: Math.max(1, state.repetitions - 1),
                      }))
                    }
                    increment={() =>
                      updateExerciseProgress(currentExercise.id, (state) => ({
                        ...state,
                        repetitions: state.repetitions + 1,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card variant="glass" className="rounded-[32px]">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="premium-subheading">Plano</p>
                    <p className="premium-heading text-lg">{plan.name}</p>
                  </div>
                  <Dumbbell className="size-5 text-primary" />
                </div>

                <Link href={`/${slug}/alunos/treinos/${planId}/executar`}>
                  <Button
                    type="button"
                    variant="premium"
                    className="h-14 w-full rounded-2xl font-semibold"
                  >
                    <Zap className="size-5" />
                    Modo Player
                  </Button>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="premium-ghost"
                    className="h-14 rounded-2xl"
                    onClick={goToPreviousExercise}
                    disabled={safeExerciseIndex === 0}
                  >
                    <ChevronLeft className="size-5" />
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="premium-ghost"
                    className="h-14 rounded-2xl"
                    onClick={goToNextExercise}
                    disabled={safeExerciseIndex === sortedExercises.length - 1}
                  >
                    Próximo
                    <ChevronRight className="size-5" />
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="premium"
                  className="h-16 w-full rounded-2xl text-base font-semibold"
                  onClick={handleCompleteSet}
                  disabled={isExerciseCompleted}
                >
                  <Check className="size-5" />
                  {isExerciseCompleted ? "Exercício concluído" : "Série concluída"}
                </Button>

                <Button
                  type="button"
                  variant="premium-ghost"
                  className="h-14 w-full rounded-2xl"
                  onClick={() => setRestActive((current) => (restSeconds > 0 ? !current : false))}
                >
                  {isRestRunning ? <Pause className="size-5" /> : <Play className="size-5" />}
                  {isRestRunning ? "Pausar descanso" : "Retomar descanso"}
                </Button>
              </CardContent>
            </Card>

            <Card variant="glass" className="rounded-[32px]">
              <CardContent className="space-y-3 p-5">
                <p className="premium-heading text-sm">Fila do treino</p>
                {sortedExercises.map((exercise, index) => {
                  const progress = mergedExerciseProgress[exercise.id];
                  const completed = progress?.completedSets ?? 0;
                  const finished = completed >= exercise.sets;

                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      onClick={() => setCurrentExerciseIndex(index)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all",
                        index === safeExerciseIndex
                          ? "premium-highlight text-primary-foreground shadow-[var(--premium-shadow)]"
                          : "premium-surface text-foreground",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{exercise.exerciseName}</p>
                        <p
                          className={cn(
                            "text-xs",
                            index === safeExerciseIndex
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {completed}/{exercise.sets} séries
                        </p>
                      </div>
                      {finished ? <Check className="size-4 shrink-0" /> : null}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
