"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Dumbbell, Moon, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listAvailability } from "@/services/availability.service";
import type { AvailabilitySlot } from "@/services/availability.service";
import { getPersonalCalendar } from "@/services/training-schedule.service";
import type { CalendarSession } from "@/services/training-schedule.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeekBounds {
  from: string;
  to: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns [Mon, Tue, Wed, Thu, Fri, Sat, Sun] as YYYY-MM-DD strings for the week
function getWeekDays(from: string): { date: string; dayOfWeek: number; label: string }[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(from + "T00:00:00");
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toISOString().split("T")[0],
      dayOfWeek: d.getDay(),
      label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
    });
  }
  return days;
}

const SESSION_TYPE_CONFIG: Record<
  "presential" | "online" | "rest",
  { bg: string; border: string; icon: React.ReactNode; label: string }
> = {
  presential: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Dumbbell className="size-3 text-emerald-600" />,
    label: "Presencial",
  },
  online: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Wifi className="size-3 text-blue-600" />,
    label: "Online",
  },
  rest: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: <Moon className="size-3 text-gray-400" />,
    label: "Descanso",
  },
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function AvailabilityStrip({ slots }: { slots: AvailabilitySlot[] }) {
  if (slots.length === 0) {
    return <p className="text-[10px] text-gray-300 italic">sem disponibilidade</p>;
  }
  return (
    <div className="flex flex-wrap gap-0.5">
      {slots
        .filter((s) => s.isActive)
        .map((s) => (
          <span
            key={s.id}
            className="rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary"
          >
            {s.startTime}–{s.endTime}
          </span>
        ))}
    </div>
  );
}

function SessionCard({ session }: { session: CalendarSession }) {
  if (session.sessionType === "rest") return null;
  const config = SESSION_TYPE_CONFIG[session.sessionType];
  const dot = STATUS_DOT[session.status] ?? "bg-gray-300";

  return (
    <div
      className={`flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-xs ${config.bg} ${config.border}`}
    >
      <div className="mt-0.5 shrink-0">{config.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-800">{session.studentName}</p>
        {session.startTime ? (
          <p className="text-[10px] text-gray-500">
            {session.startTime}
            {session.endTime ? `–${session.endTime}` : ""}
          </p>
        ) : null}
      </div>
      <span className={`mt-1 size-1.5 shrink-0 rounded-full ${dot}`} title={session.status} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CalendárioTreinosViewProps {
  week: WeekBounds;
}

export function CalendárioTreinosView({ week }: CalendárioTreinosViewProps) {
  const sessionsQuery = useQuery({
    queryKey: ["personal-calendar", week.from, week.to],
    queryFn: () => getPersonalCalendar({ from: week.from, to: week.to }),
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability"],
    queryFn: listAvailability,
    staleTime: 5 * 60 * 1000,
  });

  const weekDays = getWeekDays(week.from);
  const sessions = sessionsQuery.data ?? [];
  const slots = availabilityQuery.data ?? [];

  if (sessionsQuery.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {weekDays.map((d) => (
          <Skeleton key={d.date} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  const totalSessions = sessions.filter((s) => s.sessionType !== "rest").length;

  return (
    <div className="space-y-4">
      {/* Summary line */}
      <p className="text-xs text-muted-foreground">
        {totalSessions === 0
          ? "Nenhuma sessão de treino planejada para esta semana."
          : `${totalSessions} ${totalSessions === 1 ? "sessão planejada" : "sessões planejadas"} esta semana.`}
      </p>

      {/* Weekly grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {weekDays.map(({ date, dayOfWeek, label }) => {
          const daySessions = sessions.filter((s) => s.scheduledDate === date);
          const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
          const isToday = date === new Date().toISOString().split("T")[0];

          return (
            <div
              key={date}
              className={`rounded-xl border p-2 transition-colors ${
                isToday
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {/* Day header */}
              <div className="mb-2 border-b pb-1.5">
                <p
                  className={`text-xs font-semibold capitalize ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </p>
                <AvailabilityStrip slots={daySlots} />
              </div>

              {/* Sessions */}
              <div className="space-y-1">
                {daySessions.length === 0 ? (
                  <p className="py-2 text-center text-[10px] text-gray-300">—</p>
                ) : (
                  daySessions.map((s) => <SessionCard key={s.id} session={s} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Dumbbell className="size-3 text-emerald-500" />
          Presencial
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi className="size-3 text-blue-500" />
          Online
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3 text-primary" />
          Disponibilidade (fundo)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" />
          Pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          Concluído
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          Cancelado
        </span>
      </div>
    </div>
  );
}
