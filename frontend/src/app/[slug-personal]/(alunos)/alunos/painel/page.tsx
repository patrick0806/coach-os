"use client";

import Link from "next/link";
import { use, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ChevronRight, Dumbbell, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyBookings, type Booking } from "@/services/bookings.service";
import { getMeWorkoutPlans } from "@/services/workout-plans.service";
import { getMyStats, isStreakAtRisk } from "@/services/student-stats.service";
import { getTodaySession, getWeekSessions, getActivityHistory } from "@/services/training-schedule.service";
import { ActivityCalendar } from "./_components/activity-calendar";
import { NextSessionCard } from "./_components/next-session-card";
import { ProgressRing } from "./_components/progress-ring";
import { StreakCounter } from "./_components/streak-counter";
import { TodayTrainingCard } from "./_components/today-training-card";
import { WeekScroller } from "./_components/week-scroller";

interface AlunoPainelPageProps {
  params: Promise<{ "slug-personal": string }>;
}

function bookingDateTime(booking: Booking): Date {
  return new Date(`${booking.scheduledDate}T${booking.startTime}:00`);
}

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function AlunoPainelPage({ params }: AlunoPainelPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams["slug-personal"];

  const { data: bookingsData = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["my-bookings", "painel"],
    queryFn: getMyBookings,
  });

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["me-workout-plans"],
    queryFn: getMeWorkoutPlans,
  });

  const { data: stats } = useQuery({
    queryKey: ["my-stats"],
    queryFn: getMyStats,
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const { data: todaySession = null } = useQuery({
    queryKey: ["training-sessions", "today"],
    queryFn: getTodaySession,
  });

  const { data: weekSessions = [] } = useQuery({
    queryKey: ["training-sessions", "week"],
    queryFn: getWeekSessions,
  });

  const { data: activityHistory = [] } = useQuery({
    queryKey: ["training-sessions", "history"],
    queryFn: () => getActivityHistory(84),
  });

  // Resolve workout plan name from today's session
  const todayPlanName = useMemo(() => {
    if (!todaySession?.workoutPlanId) return null;
    return plans.find((p) => p.id === todaySession.workoutPlanId)?.name ?? null;
  }, [todaySession, plans]);

  // Toast when there is a pending training session today
  useEffect(() => {
    if (todaySession && todaySession.status === "pending" && todaySession.sessionType !== "rest") {
      toast("Você tem um treino agendado para hoje! 💪", { duration: 5000 });
    }
  // Show once per mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaySession?.id]);

  // Motivational toast when streak is at risk (last workout was yesterday)
  useEffect(() => {
    if (stats && isStreakAtRisk(stats) && stats.currentStreak > 0) {
      toast(`🔥 Sequência de ${stats.currentStreak} dias em risco! Treine hoje para não perder.`, {
        duration: 6000,
      });
    }
  // Show once per mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats?.currentStreak, stats?.lastWorkoutDate]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    return bookings
      .filter((booking) => booking.status === "scheduled" && bookingDateTime(booking) >= now)
      .sort((a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime());
  }, [bookingsData]);

  const nextSession = upcomingBookings[0];
  const nextThreeSessions = upcomingBookings.slice(0, 3);
  const completedBookings = bookingsData.filter((booking) => booking.status === "completed").length;
  const scheduledBookings = bookingsData.filter((booking) => booking.status === "scheduled").length;
  const workoutGoal = 12;
  const progressValue = Math.min(100, Math.round((completedBookings / workoutGoal) * 100));
  const consistencyValue = Math.min(
    100,
    Math.round(((completedBookings + scheduledBookings) / Math.max(workoutGoal, 1)) * 100),
  );

  return (
    <div className="mx-auto max-w-3xl p-4 pb-28 sm:p-8">
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--premium-border)] bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Seu app de treino
        </span>
        <h1 className="premium-heading text-3xl">Painel do Aluno</h1>
        <p className="premium-subheading">Sua rotina, suas próximas sessões e seu progresso em um só lugar.</p>
      </div>

      {stats ? (
        <div className="mb-4 space-y-3">
          <StreakCounter streak={stats.currentStreak} totalWorkouts={stats.totalWorkouts} />
          {activityHistory.length > 0 && (
            <ActivityCalendar sessions={activityHistory} weeks={12} />
          )}
        </div>
      ) : null}

      {/* Week scroller + today's training — Epic 20 */}
      <section className="mb-6 space-y-3">
        <WeekScroller sessions={weekSessions} todayStr={todayStr} slug={slug} />
        <TodayTrainingCard session={todaySession} workoutPlanName={todayPlanName} slug={slug} />
      </section>

      <section className="mb-6 space-y-4">
        {loadingBookings ? (
          <div className="space-y-3">
            <div className="h-48 animate-pulse rounded-3xl bg-accent/60" />
            <div className="h-32 animate-pulse rounded-3xl bg-accent/60" />
          </div>
        ) : nextSession ? (
          <>
            <NextSessionCard booking={nextSession} slug={slug} />

            <div className="grid gap-3 sm:grid-cols-2">
              <ProgressRing
                value={progressValue}
                label="Meta do mês"
                helper={`${completedBookings} de ${workoutGoal} sessões concluídas`}
              />
              <ProgressRing
                value={consistencyValue}
                label="Constância"
                helper={`${scheduledBookings} sessões ainda reservadas`}
              />
            </div>

            <Card variant="glass" className="rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  Próximas sessões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {nextThreeSessions.map((booking) => (
                  <div
                    key={booking.id}
                    className="premium-surface flex items-center justify-between rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{booking.servicePlanName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatShortDate(booking.scheduledDate)} · {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">Agendado</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card variant="premium" className="rounded-3xl">
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white/12 text-primary-foreground">
                <CalendarDays className="size-7" />
              </div>
              <p className="premium-heading mb-2 text-lg text-primary-foreground">Nenhuma sessão marcada</p>
              <p className="mx-auto max-w-sm text-sm text-primary-foreground/80">
                Nenhum treino hoje? Que tal organizar sua próxima sessão e manter o ritmo da semana.
              </p>
              <Button asChild variant="premium-ghost" className="mt-5 border-white/20 bg-white/12 text-primary-foreground hover:bg-white/18 hover:text-primary-foreground">
                <Link href={`/${slug}/alunos/agenda`}>
                  Ir para agenda
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

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

        {loadingPlans ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-3xl bg-accent/60" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card variant="glass" className="rounded-3xl">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum treino atribuído ainda. Seu personal vai liberar seus próximos blocos por aqui.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {plans.slice(0, 3).map((plan) => (
              <Link
                key={plan.id}
                href={`/${slug}/alunos/treinos/${plan.id}`}
                className="premium-surface flex items-center justify-between rounded-3xl px-4 py-4 transition-all hover:scale-[1.01] hover:bg-accent/20"
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
