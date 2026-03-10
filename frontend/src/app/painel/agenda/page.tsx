"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CalendarDays, Repeat2 } from "lucide-react";
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
import { BookingDetailDialog } from "./_components/booking-detail-dialog";
import { AddSessionDialog } from "./_components/add-session-dialog";

const STATUS_TABS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "scheduled", label: "Agendados" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
  { value: "no-show", label: "Não compareceu" },
];

function getWeekBounds(ref: Date): { from: string; to: string; label: string } {
  const d = new Date(ref);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (dt: Date) => dt.toISOString().split("T")[0];
  const label = `${monday.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${sunday.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;
  return { from: fmt(monday), to: fmt(sunday), label };
}

function groupByDate(bookings: Booking[]): [string, Booking[]][] {
  const map = new Map<string, Booking[]>();
  for (const b of bookings) {
    const list = map.get(b.scheduledDate) ?? [];
    list.push(b);
    map.set(b.scheduledDate, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function formatDateHeader(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function AgendaPage() {
  const [weekRef, setWeekRef] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addSessionOpen, setAddSessionOpen] = useState(false);

  const week = getWeekBounds(weekRef);

  const { data, isLoading } = useQuery({
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

  const bookings = data?.content ?? [];
  const grouped = groupByDate(bookings);

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

  return (
    <>
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Agenda</h1>
            <p className="mt-1 text-sm text-gray-500">Gerencie suas sessões agendadas.</p>
          </div>
          <Link href="/painel/agenda/disponibilidade">
            <Button variant="outline" size="sm">
              Configurar disponibilidade
            </Button>
          </Link>
          <Button size="sm" onClick={() => setAddSessionOpen(true)}>
            Adicionar sessão
          </Button>
        </div>

        {/* Week navigation */}
        <div className="mb-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">{week.label}</span>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday} className="text-xs text-gray-500">
            Hoje
          </Button>
        </div>

        {/* Status tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center text-gray-400">
              <CalendarDays className="mb-3 size-10 opacity-30" />
              <p>Nenhum agendamento neste período.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, dayBookings]) => (
              <section key={date}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 capitalize">
                  {formatDateHeader(date)}
                </h2>
                <div className="space-y-2">
                  {dayBookings
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="text-center text-sm">
                          <p className="font-semibold text-gray-900">{booking.startTime}</p>
                          <p className="text-xs text-gray-400">{booking.endTime}</p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 truncate font-medium text-gray-900">
                            <span className="truncate">{booking.studentName}</span>
                            {booking.isRecurring ? (
                              <Repeat2 className="size-3.5 shrink-0 text-muted-foreground" title="Sessão recorrente" />
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {booking.servicePlanName}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}
                        >
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </button>
                    ))}
                </div>
              </section>
            ))}
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
