import Link from "next/link";
import { CheckCircle2, Dumbbell, Moon, Play, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TrainingSession } from "@/services/training-schedule.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TodayTrainingCardProps {
  session: TrainingSession | null;
  workoutPlanName: string | null;
  slug: string;
}

function buildExecutarUrl(slug: string, workoutPlanId: string, trainingSessionId: string): string {
  return `/${slug}/alunos/treinos/${workoutPlanId}/executar?trainingSessionId=${trainingSessionId}`;
}

// ─── States ───────────────────────────────────────────────────────────────────

function RestDayCard() {
  return (
    <Card variant="glass" className="rounded-3xl">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/8">
          <Moon className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="premium-heading text-lg">Dia de Descanso</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recuperação é parte do treino. Descanse bem hoje! 💤
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CompletedCard({ planName }: { planName: string | null }) {
  return (
    <Card variant="glass" className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15">
          <CheckCircle2 className="size-7 text-emerald-400" />
        </div>
        <div>
          <p className="premium-heading text-lg text-emerald-400">Treino Concluído!</p>
          {planName ? (
            <p className="mt-0.5 text-sm font-medium text-foreground/80">{planName}</p>
          ) : null}
          <p className="mt-1 text-sm text-muted-foreground">
            Incrível! Você completou o treino de hoje. 🏆
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NoSessionCard() {
  return (
    <Card variant="glass" className="rounded-3xl">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/8">
          <Dumbbell className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="premium-heading text-lg">Sem treino hoje</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu personal ainda não configurou a agenda desta semana.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TodayTrainingCard({ session, workoutPlanName, slug }: TodayTrainingCardProps) {
  if (!session) return <NoSessionCard />;

  if (session.sessionType === "rest") return <RestDayCard />;

  if (session.status === "completed") return <CompletedCard planName={workoutPlanName} />;

  // pending — primary call to action
  const isPresential = session.sessionType === "presential";
  const SessionTypeIcon = isPresential ? Dumbbell : Wifi;
  const sessionTypeLabel = isPresential ? "Treino Presencial" : "Treino Online";

  return (
    <Card variant="premium" className="premium-highlight overflow-hidden rounded-3xl text-primary-foreground">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-white/15">
              <SessionTypeIcon className="size-4 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
              {sessionTypeLabel}
            </span>
          </div>

          {session.scheduledTime ? (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-primary-foreground">
              {session.scheduledTime}
            </span>
          ) : null}
        </div>

        {/* Plan name */}
        <div className="mb-5 space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground/60">
            Treino de Hoje
          </p>
          <p className="text-2xl font-bold text-primary-foreground">
            {workoutPlanName ?? "Treino do dia"}
          </p>
        </div>

        {/* CTA */}
        {session.workoutPlanId ? (
          <Button
            asChild
            size="lg"
            className="w-full gap-2 bg-white text-primary shadow-lg hover:bg-white/90"
          >
            <Link href={buildExecutarUrl(slug, session.workoutPlanId, session.id)}>
              <Play className="size-4 fill-current" />
              Iniciar Treino
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            size="lg"
            variant="premium-ghost"
            className="w-full border-white/20 bg-white/12 text-primary-foreground"
          >
            Treino não configurado
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
