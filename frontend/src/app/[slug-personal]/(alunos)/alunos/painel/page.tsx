"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Dumbbell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyBookings, type Booking } from "@/services/bookings.service";
import { getMeWorkoutPlans } from "@/services/workout-plans.service";
import { NextSessionCard } from "./_components/next-session-card";

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

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    const bookings = Array.isArray(bookingsData) ? bookingsData : [];
    return bookings
      .filter((booking) => booking.status === "scheduled" && bookingDateTime(booking) >= now)
      .sort((a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime());
  }, [bookingsData]);

  const nextSession = upcomingBookings[0];
  const nextThreeSessions = upcomingBookings.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Painel do Aluno</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bem-vindo de volta!</p>
      </div>

      <section className="mb-6 space-y-4">
        {loadingBookings ? (
          <div className="space-y-3">
            <div className="h-28 animate-pulse rounded-xl bg-accent" />
            <div className="h-16 animate-pulse rounded-xl bg-accent" />
            <div className="h-16 animate-pulse rounded-xl bg-accent" />
          </div>
        ) : nextSession ? (
          <>
            <NextSessionCard booking={nextSession} />

            <Card>
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
                    className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
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
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              <p className="mb-2">Você não possui sessões futuras agendadas.</p>
              <Link href={`/${slug}/alunos/agenda`} className="font-medium text-primary hover:underline">
                Ir para agenda e agendar
              </Link>
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
