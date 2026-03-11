"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, History } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BOOKING_STATUS_LABELS,
  getStudentBookings,
  type Booking,
} from "@/services/bookings.service";

interface StudentBookingsSectionProps {
  studentId: string;
}

function bookingDateTime(booking: Booking): Date {
  return new Date(`${booking.scheduledDate}T${booking.startTime}:00`);
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function StudentBookingsSection({ studentId }: StudentBookingsSectionProps) {
  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ["student-bookings", studentId],
    queryFn: () => getStudentBookings(studentId),
  });

  const { upcoming, history } = useMemo(() => {
    const now = new Date();
    const sorted = [...bookings].sort(
      (a, b) => bookingDateTime(a).getTime() - bookingDateTime(b).getTime(),
    );

    return {
      upcoming: sorted
        .filter(
          (booking) =>
            booking.status === "scheduled" && bookingDateTime(booking) >= now,
        )
        .slice(0, 5),
      history: sorted
        .filter(
          (booking) =>
            booking.status !== "scheduled" || bookingDateTime(booking) < now,
        )
        .reverse()
        .slice(0, 5),
    };
  }, [bookings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-gray-400" />
          Agendamentos do aluno
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar os agendamentos deste aluno.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock3 className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Próximos agendamentos
                </h3>
              </div>

              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento futuro para este aluno.
                </p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border bg-card px-4 py-3"
                    >
                      <p className="font-medium text-foreground">
                        {booking.servicePlanName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(booking.scheduledDate)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Histórico recente
                </h3>
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum histórico de agendamentos ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {history.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border bg-card px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.servicePlanName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDate(booking.scheduledDate)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
