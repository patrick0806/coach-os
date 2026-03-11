"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CalendarDays, Dumbbell, MessageCircleMore, Sparkles, UserCircle2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listBookings, type Booking } from "@/services/bookings.service";
import { getMyProfile } from "@/services/personals.service";
import { listStudents } from "@/services/students.service";
import { listWorkoutPlans } from "@/services/workout-plans.service";
import { StatCard } from "./_components/stat-card";

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSessionDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function compareSessions(a: Booking, b: Booking): number {
  const left = `${a.scheduledDate}T${a.startTime}:00`;
  const right = `${b.scheduledDate}T${b.startTime}:00`;
  return left.localeCompare(right);
}

export default function PainelPage() {
  const today = useMemo(() => toIsoDate(new Date()), []);
  const next7Days = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return toIsoDate(date);
  }, []);

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ["students", "dashboard-count"],
    queryFn: () => listStudents({ page: 1, size: 1 }),
  });
  const { data: activeStudentsPreview, isLoading: loadingActiveStudentsPreview } = useQuery({
    queryKey: ["students", "dashboard-preview"],
    queryFn: () => listStudents({ page: 1, size: 6 }),
  });

  const { data: todayBookings, isLoading: loadingTodayBookings } = useQuery({
    queryKey: ["bookings", "dashboard-today", today],
    queryFn: () =>
      listBookings({
        from: today,
        to: today,
        status: "scheduled",
        page: 1,
        size: 100,
      }),
  });

  const { data: nextBookings, isLoading: loadingNextBookings } = useQuery({
    queryKey: ["bookings", "dashboard-next", today, next7Days],
    queryFn: () =>
      listBookings({
        from: today,
        to: next7Days,
        status: "scheduled",
        page: 1,
        size: 5,
      }),
  });

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["workout-plans", "dashboard-count"],
    queryFn: () => listWorkoutPlans({ page: 1, size: 1 }),
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["personals", "me", "profile", "dashboard"],
    queryFn: getMyProfile,
  });

  const sortedTodayBookings = [...(todayBookings?.content ?? [])].sort(compareSessions);
  const upcomingBookings = [...(nextBookings?.content ?? [])].sort(compareSessions);
  const nextSessionToday = sortedTodayBookings[0];
  const studentPreview = (activeStudentsPreview?.content ?? []).slice(0, 6);

  const showOnboardingHint = !loadingProfile && (!profile?.bio || !profile?.profilePhoto);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 space-y-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--premium-border)] bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Centro de comando
        </span>
        <h1 className="premium-heading text-3xl">Início</h1>
        <p className="premium-subheading">Visão geral do seu dia, dos alunos ativos e das próximas decisões rápidas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Alunos ativos"
          value={String(students?.totalElements ?? 0)}
          description="Veja e gerencie seus alunos"
          href="/painel/alunos"
          icon={<Users className="size-4" />}
          loading={loadingStudents}
        />
        <StatCard
          title="Sessões hoje"
          value={String(todayBookings?.totalElements ?? 0)}
          description="Agendamentos confirmados para hoje"
          href="/painel/agenda"
          icon={<CalendarDays className="size-4" />}
          loading={loadingTodayBookings}
        />
        <StatCard
          title="Próxima sessão do dia"
          value={nextSessionToday ? nextSessionToday.startTime : "Sem sessões"}
          description={
            nextSessionToday
              ? `${nextSessionToday.studentName} · ${nextSessionToday.servicePlanName}`
              : "Nenhum agendamento para hoje"
          }
          icon={<CalendarClock className="size-4" />}
          loading={loadingTodayBookings}
        />
        <StatCard
          title="Planos de treino"
          value={String(plans?.totalElements ?? 0)}
          description="Treinos cadastrados na plataforma"
          href="/painel/treinos"
          icon={<Dumbbell className="size-4" />}
          loading={loadingPlans}
        />
      </div>

      {showOnboardingHint ? (
        <Card variant="glass" className="mt-6 rounded-3xl">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <UserCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Complete seu perfil profissional</p>
                <p className="text-sm text-muted-foreground">
                  Adicione foto e bio para fortalecer sua presença na landing page.
                </p>
              </div>
            </div>
            <Link href="/painel/perfil" className="text-sm font-medium text-primary hover:underline">
              Configurar perfil
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="glass" className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximas sessões</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNextBookings ? (
              <div className="space-y-2.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-2xl bg-accent/60" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--premium-border)] bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Você ainda não possui sessões agendadas para os próximos dias.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="premium-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{booking.studentName}</p>
                      <p className="text-sm text-muted-foreground">{booking.servicePlanName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatSessionDate(booking.scheduledDate)}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card variant="glass" className="rounded-3xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Alunos ativos</CardTitle>
              <Button asChild variant="premium-ghost" size="sm">
                <Link href="/painel/alunos">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingActiveStudentsPreview ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-accent/60" />
              ))
            ) : studentPreview.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--premium-border)] bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum aluno ativo ainda. Use o atalho rápido para convidar o primeiro.
              </div>
            ) : (
              studentPreview.map((student) => (
                <div
                  key={student.id}
                  className="premium-surface flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{student.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {student.servicePlanName ?? "Sem plano vinculado"}
                    </p>
                  </div>
                  <Button asChild variant="premium-ghost" size="icon-sm">
                    <Link href={`/painel/alunos/${student.id}`} aria-label={`Abrir ${student.name}`}>
                      <MessageCircleMore className="size-4" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>*/}
      </div>
    </div>
  );
}
