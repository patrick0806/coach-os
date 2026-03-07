"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CalendarDays, Dumbbell, UserCircle2, Users } from "lucide-react";

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

  const showOnboardingHint = !loadingProfile && (!profile?.bio || !profile?.profilePhoto);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Início</h1>
        <p className="mt-1 text-sm text-gray-500">Visão geral do seu dia e da sua operação.</p>
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
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <UserCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">Complete seu perfil profissional</p>
                <p className="text-sm text-gray-600">
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

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Próximas sessões</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNextBookings ? (
            <div className="space-y-2.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Você ainda não possui sessões agendadas para os próximos dias.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{booking.studentName}</p>
                    <p className="text-sm text-gray-500">{booking.servicePlanName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatSessionDate(booking.scheduledDate)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.startTime} - {booking.endTime}
                    </p>
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
