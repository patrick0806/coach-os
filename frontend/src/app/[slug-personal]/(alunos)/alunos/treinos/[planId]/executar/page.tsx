"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";

import { ExerciseMedia } from "@/components/shared/exercise-media";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  MUSCLE_GROUP_COLORS,
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from "@/services/exercises.service";
import {
  getMeWorkoutPlan,
  startWorkoutSession,
  updateSessionStep,
  completeWorkoutSession,
  type WorkoutSession,
} from "@/services/workout-plans.service";

interface PageProps {
  params: Promise<{ "slug-personal": string; planId: string }>;
}

interface ExerciseProgressState {
  completedSets: number;
}

function parseRestSeconds(restTime: string | null): number {
  if (!restTime) return 90;
  const value = Number.parseInt(restTime, 10);
  return Number.isFinite(value) && value > 0 ? value : 90;
}

function formatTimer(total: number): string {
  const safe = Math.max(0, total);
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const s = (safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ------------------------------------------------------------------
// Rest Timer Overlay
// ------------------------------------------------------------------
interface RestTimerOverlayProps {
  seconds: number;
  total: number;
  onSkip: () => void;
}

function RestTimerOverlay({ seconds, total, onSkip }: RestTimerOverlayProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? seconds / total : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-white/60">
        Tempo de descanso
      </p>

      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="-rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="absolute text-4xl font-bold tabular-nums text-white">
          {formatTimer(seconds)}
        </span>
      </div>

      <Button
        variant="premium-ghost"
        className="mt-8 gap-2 text-white/70 hover:text-white"
        onClick={onSkip}
      >
        <X className="size-4" />
        Pular descanso
      </Button>
    </div>
  );
}

// ------------------------------------------------------------------
// Completion Modal
// ------------------------------------------------------------------
interface CompletionModalProps {
  planName: string;
  slug: string;
  totalSets: number;
  onClose: () => void;
}

function CompletionModal({ planName, slug, totalSets, onClose }: CompletionModalProps) {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#a855f7", "#8b5cf6", "#6366f1", "#ffffff"],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md">
      <div className="premium-glass w-full max-w-sm rounded-3xl p-8 text-center">
        <Flame className="mx-auto mb-4 size-12 text-primary" />
        <h2 className="premium-heading text-2xl">Treino concluído!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {planName} · {totalSets} séries completadas
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/${slug}/alunos/treinos`}>
            <Button variant="premium" className="w-full rounded-2xl" onClick={onClose}>
              <Check className="size-4" />
              Voltar aos treinos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Page
// ------------------------------------------------------------------
export default function ExecutarPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { "slug-personal": slug, planId } = resolvedParams;
  const queryClient = useQueryClient();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgressState>>(
    {},
  );
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Debounce ref for step sync to avoid too many requests
  const stepSyncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["me-workout-plan", planId],
    queryFn: () => getMeWorkoutPlan(planId),
  });

  const sortedExercises = useMemo(
    () => [...(plan?.exercises ?? [])].sort((a, b) => a.order - b.order),
    [plan?.exercises],
  );

  // Start session on mount
  const startMutation = useMutation({
    mutationFn: () => startWorkoutSession(planId),
    onSuccess: (data) => {
      setSession(data);
      if (data.currentStep > 0 && data.currentStep < sortedExercises.length) {
        setCurrentExerciseIndex(data.currentStep);
      }
    },
  });

  useEffect(() => {
    if (sortedExercises.length > 0 && !session) {
      startMutation.mutate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedExercises.length]);

  // Rest timer countdown
  useEffect(() => {
    if (!restActive || restSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          setRestActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [restActive, restSeconds]);

  const syncStep = useCallback(
    (index: number) => {
      if (!session) return;
      if (stepSyncTimeout.current) clearTimeout(stepSyncTimeout.current);
      stepSyncTimeout.current = setTimeout(() => {
        updateSessionStep(session.id, index).catch(() => {
          // Silent fail — progress is local anyway
        });
      }, 500);
    },
    [session],
  );

  const completeMutation = useMutation({
    mutationFn: () => completeWorkoutSession(session!.id),
    onSuccess: () => {
      setCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["me-workout-plans"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-4">
        <Skeleton className="h-12 rounded-2xl bg-accent/60" />
        <Skeleton className="aspect-video rounded-3xl bg-accent/60" />
        <Skeleton className="h-32 rounded-3xl bg-accent/60" />
      </div>
    );
  }

  if (!plan || sortedExercises.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 text-muted-foreground">
        <p>Treino não encontrado ou sem exercícios.</p>
        <Link href={`/${slug}/alunos/treinos`} className="text-sm text-primary hover:underline">
          Voltar para treinos
        </Link>
      </div>
    );
  }

  const safeIndex = Math.min(currentExerciseIndex, sortedExercises.length - 1);
  const currentExercise = sortedExercises[safeIndex];

  const mergedProgress = sortedExercises.reduce<Record<string, ExerciseProgressState>>(
    (acc, ex) => {
      acc[ex.id] = exerciseProgress[ex.id] ?? { completedSets: 0 };
      return acc;
    },
    {},
  );

  const currentProgress = mergedProgress[currentExercise.id] ?? { completedSets: 0 };
  const totalSets = sortedExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSetsTotal = Object.values(mergedProgress).reduce(
    (sum, ex) => sum + ex.completedSets,
    0,
  );
  const progressPercent = Math.round((completedSetsTotal / Math.max(totalSets, 1)) * 100);
  const isExerciseFinished = currentProgress.completedSets >= currentExercise.sets;
  const currentSetNumber = Math.min(currentProgress.completedSets + 1, currentExercise.sets);
  const allExercisesDone = sortedExercises.every(
    (ex) => (mergedProgress[ex.id]?.completedSets ?? 0) >= ex.sets,
  );

  function handleCompleteSet() {
    if (isExerciseFinished) return;

    setExerciseProgress((prev) => ({
      ...prev,
      [currentExercise.id]: {
        completedSets: Math.min(
          (prev[currentExercise.id]?.completedSets ?? 0) + 1,
          currentExercise.sets,
        ),
      },
    }));

    const restSecs = parseRestSeconds(currentExercise.restTime);
    setRestTotal(restSecs);
    setRestSeconds(restSecs);
    setRestActive(true);
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, sortedExercises.length - 1));
    setCurrentExerciseIndex(next);
    syncStep(next);
  }

  function handleFinishWorkout() {
    if (!session) return;
    completeMutation.mutate();
  }

  return (
    <>
      {/* Rest Timer Overlay */}
      {restActive && restSeconds > 0 ? (
        <RestTimerOverlay
          seconds={restSeconds}
          total={restTotal}
          onSkip={() => {
            setRestActive(false);
            setRestSeconds(0);
          }}
        />
      ) : null}

      {/* Completion Modal */}
      {completed ? (
        <CompletionModal
          planName={plan.name}
          slug={slug}
          totalSets={completedSetsTotal}
          onClose={() => setCompleted(false)}
        />
      ) : null}

      <div className="min-h-screen bg-background">
        {/* Progress bar — top */}
        <div className="fixed inset-x-0 top-0 z-30 h-1 bg-white/10">
          <div
            className="h-full bg-primary transition-[width] duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pb-32 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/${slug}/alunos/treinos/${planId}`}
              className="premium-glass inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground"
            >
              <ArrowLeft className="size-4" />
              Sair
            </Link>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Dumbbell className="size-4 text-primary" />
              <span className="font-medium text-foreground">
                {safeIndex + 1}/{sortedExercises.length}
              </span>
            </div>
          </div>

          {/* Exercise name + set info */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {MUSCLE_GROUP_LABELS[currentExercise.muscleGroup as MuscleGroup] ??
                currentExercise.muscleGroup}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {currentExercise.exerciseName}
            </h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  MUSCLE_GROUP_COLORS[currentExercise.muscleGroup as MuscleGroup] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                Série {currentSetNumber} de {currentExercise.sets}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs">
                Meta: {currentExercise.sets} × {currentExercise.repetitions} reps
              </span>
              {currentExercise.load ? (
                <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs">
                  Última carga: {currentExercise.load}
                </span>
              ) : null}
            </div>
          </div>

          {/* Media */}
          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[var(--premium-shadow-strong)]">
            <ExerciseMedia
              exercisedbGifUrl={currentExercise.exercisedbGifUrl}
              youtubeUrl={currentExercise.youtubeUrl}
              exerciseName={currentExercise.exerciseName}
            />
          </div>

          {/* Notes */}
          {currentExercise.notes ? (
            <div className="premium-surface rounded-2xl px-4 py-3 text-sm text-muted-foreground">
              {currentExercise.notes}
            </div>
          ) : null}

          {/* Exercise queue */}
          <div className="premium-glass rounded-3xl p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Fila do treino
            </p>
            <div className="space-y-2">
              {sortedExercises.map((ex, index) => {
                const prog = mergedProgress[ex.id];
                const done = (prog?.completedSets ?? 0) >= ex.sets;
                return (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => goTo(index)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left transition-all",
                      index === safeIndex
                        ? "premium-highlight text-primary-foreground"
                        : "premium-surface text-foreground",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ex.exerciseName}</p>
                      <p
                        className={cn(
                          "text-xs",
                          index === safeIndex ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {prog?.completedSets ?? 0}/{ex.sets} séries
                      </p>
                    </div>
                    {done ? <Check className="size-3.5 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed bottom action bar */}
        <div className="fixed inset-x-0 bottom-0 z-20 p-4">
          <div className="premium-glass mx-auto max-w-2xl rounded-3xl p-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="premium-ghost"
                className="h-14 rounded-2xl"
                onClick={() => goTo(safeIndex - 1)}
                disabled={safeIndex === 0}
              >
                <ChevronLeft className="size-5" />
                Anterior
              </Button>

              {isExerciseFinished && safeIndex < sortedExercises.length - 1 ? (
                <Button
                  type="button"
                  variant="premium"
                  className="h-14 rounded-2xl"
                  onClick={() => goTo(safeIndex + 1)}
                >
                  Próximo
                  <ChevronRight className="size-5" />
                </Button>
              ) : isExerciseFinished && allExercisesDone ? (
                <Button
                  type="button"
                  variant="premium"
                  className="h-14 rounded-2xl font-semibold"
                  onClick={handleFinishWorkout}
                  disabled={completeMutation.isPending}
                >
                  <Flame className="size-5" />
                  {completeMutation.isPending ? "Salvando..." : "Finalizar treino"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="premium"
                  className="h-14 rounded-2xl font-semibold"
                  onClick={handleCompleteSet}
                  disabled={isExerciseFinished}
                >
                  <Check className="size-5" />
                  {isExerciseFinished ? "Concluído" : "Série concluída"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
