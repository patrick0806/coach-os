"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CalendarDays, Repeat2, Sparkles, Dumbbell, Wifi } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  listBookings,
  type Booking,
  type BookingStatus,
} from "@/services/bookings.service";
import { getPersonalCalendar, type CalendarSession } from "@/services/training-schedule.service";
import { BookingDetailDialog } from "./_components/booking-detail-dialog";
import { AddSessionDialog } from "./_components/add-session-dialog";
import { getWeekBounds, formatDateHeader, todayIso } from "@/lib/date";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "scheduled", label: "Agendados/Pendentes" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
  { value: "no-show", label: "Não compareceu" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type AgendaItemType = "booking" | "session";

interface AgendaItem {
  id: string;
  type: AgendaItemType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  studentName: string;
  status: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  isRecurring?: boolean;
  rawBooking?: Booking;
  rawSession?: CalendarSession;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(items: AgendaItem[]): [string, AgendaItem[]][] {
  const map = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const list = map.get(item.scheduledDate) ?? [];
    list.push(item);
    map.set(item.scheduledDate, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const shouldStartAddSessionOpen =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("action") === "new-session";

  const [weekRef, setWeekRef] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addSessionOpen, setAddSessionOpen] = useState(shouldStartAddSessionOpen);

  const week = getWeekBounds(weekRef);
  const todayStr = todayIso();

  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["bookings", { from: week.from, to: week.to, status: statusFilter }],
    queryFn: () =>
      listBookings({
        from: week.from,
        to: week.to,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: 1,
        size: 100,
      }),
  });

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["personal-calendar", week.from, week.to],
    queryFn: () => getPersonalCalendar({ from: week.from, to: week.to }),
  });

  const isLoading = isLoadingBookings || isLoadingSessions;

  const agendaItems = useMemo(() => {
    const items: AgendaItem[] = [];

    const bookings = bookingsData?.content ?? [];
    for (const b of bookings) {
      items.push({
        id: `booking-${b.id}`,
        type: "booking",
        scheduledDate: b.scheduledDate,
        startTime: b.startTime,
        endTime: b.endTime,
        studentName: b.studentName,
        status: b.status,
        title: "Sessão Avulsa",
        subtitle: b.servicePlanName,
        isRecurring: b.isRecurring,
        rawBooking: b,
      });
    }

    const sessions = sessionsData ?? [];
    for (const s of sessions) {
      if (s.sessionType === "rest") continue;

      if (statusFilter !== "all") {
        if (statusFilter === "scheduled" && s.status !== "pending") continue;
        if (statusFilter === "completed" && s.status !== "completed") continue;
        if (statusFilter === "cancelled" && s.status !== "cancelled") continue;
        if (statusFilter === "no-show") continue;
      }

      const isPresential = s.sessionType === "presential";
      items.push({
        id: `session-${s.id}`,
        type: "session",
        scheduledDate: s.scheduledDate,
        startTime: s.startTime || "00:00",
        endTime: s.endTime || "23:59",
        studentName: s.studentName,
        status: s.status === "pending" ? "scheduled" : s.status,
        title: isPresential ? "Treino Presencial" : "Treino Online",
        subtitle: "Recorrente",
        icon: isPresential ? <Dumbbell className="size-3.5" /> : <Wifi className="size-3.5" />,
        isRecurring: true,
        rawSession: s,
      });
    }

    return items;
  }, [bookingsData, sessionsData, statusFilter]);

  const grouped = groupByDate(agendaItems);

  function prevWeek() {
    const d = new Date(weekRef);
    d.setDate(d.getDate() - 7);
    setWeekRef(d);
  }

  function nextWeek() {
    const d = new Date(weekRef);
    d.setDate(d.getDate() + 7);
    setWeekRef(d);
  }

  function goToday() {
    setWeekRef(new Date());
  }

  // Highlight today logic
  const todayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (todayRef.current && !isLoading) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isLoading, weekRef]);

  return (
    <>
      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--premium-border)] bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Operação semanal
            </span>
            <h1 className="premium-heading text-3xl">Agenda</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gerencie seus compromissos e sessões de treino.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/painel/agenda/disponibilidade">
              <Button variant="premium-ghost" size="sm">
                Configurar disponibilidade
              </Button>
            </Link>
            <Button variant="premium" size="sm" onClick={() => setAddSessionOpen(true)}>
              Adicionar avulso
            </Button>
          </div>
        </div>

        {/* Week navigation */}
        <div className="mb-4 flex items-center gap-2">
          <Button variant="premium-ghost" size="sm" onClick={prevWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex-1 text-center text-sm font-medium text-foreground">{week.label}</span>
          <Button variant="premium-ghost" size="sm" onClick={nextWeek}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="text-xs text-muted-foreground">
            Hoje
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === tab.value
                  ? "premium-highlight text-primary-foreground shadow-[var(--premium-shadow)]"
                  : "premium-glass text-muted-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-accent/60" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <Card variant="glass" className="rounded-3xl">
            <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
              <CalendarDays className="mb-3 size-10 opacity-30" />
              <p>Nenhum compromisso neste período.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, dayItems]) => {
              const isToday = date === todayStr;
              return (
                <section key={date} ref={isToday ? todayRef : null} className={isToday ? "rounded-3xl bg-primary/5 p-4 outline outline-2 outline-primary/20" : "p-2"}>
                  <h2 className={`mb-3 text-xs font-semibold uppercase tracking-wide capitalize ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {formatDateHeader(date)}
                  </h2>
                  <div className="space-y-2">
                    {dayItems
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.type === "booking") {
                              setSelectedBooking(item.rawBooking!);
                            }
                          }}
                          className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all hover:scale-[1.01] ${item.type === "session" ? "bg-accent/30 border border-border" : "premium-surface"}`}
                        >
                          <div className="text-center text-sm w-16 shrink-0">
                            <p className="font-semibold text-foreground">{item.startTime}</p>
                            <p className="text-xs text-muted-foreground">{item.endTime}</p>
                          </div>

                          <div className="min-w-0 flex-1 border-l pl-4 border-border">
                            <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
                              {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                              <span className="truncate">{item.studentName}</span>
                              {item.isRecurring ? (
                                <Repeat2
                                  aria-label="Sessão recorrente"
                                  className="size-3.5 shrink-0 text-muted-foreground"
                                />
                              ) : null}
                            </p>
                            <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                              <span className="font-semibold">{item.title}</span>
                              {item.subtitle && <span>• {item.subtitle}</span>}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${BOOKING_STATUS_COLORS[item.status as BookingStatus] || "bg-gray-100 text-gray-700"}`}
                          >
                            {BOOKING_STATUS_LABELS[item.status as BookingStatus] || item.status}
                          </span>
                        </button>
                      ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BookingDetailDialog
        booking={selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      />
      <AddSessionDialog open={addSessionOpen} onOpenChange={setAddSessionOpen} />
    </>
  );
}
