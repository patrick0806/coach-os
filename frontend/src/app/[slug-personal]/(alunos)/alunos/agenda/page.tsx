"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  createBooking,
  getAvailableSlots,
  getMyBookings,
  type AvailableSlot,
  type Booking,
} from "@/services/bookings.service";
import { formatPrice, listServicePlans } from "@/services/service-plans.service";

// ─── Upcoming bookings list ───────────────────────────────────────────────────

function UpcomingBookings({ bookings }: { bookings: Booking[] }) {
  const upcoming = bookings
    .filter((b) => b.status === "scheduled")
    .sort(
      (a, b) =>
        `${a.scheduledDate}T${a.startTime}`.localeCompare(`${b.scheduledDate}T${b.startTime}`),
    )
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-muted-foreground" />
          Próximas sessões
        </CardTitle>
      </CardHeader>
      <Separator className="bg-border/50" />
      <CardContent className="pt-4">
        <div className="space-y-3">
          {upcoming.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
            >
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">
                  {new Date(b.scheduledDate + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">{b.startTime}</p>
              </div>
              <Separator orientation="vertical" className="h-8 bg-border/50" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.servicePlanName}</p>
                <p className="text-xs text-muted-foreground">
                  {b.startTime} – {b.endTime}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${BOOKING_STATUS_COLORS[b.status]}`}
              >
                {BOOKING_STATUS_LABELS[b.status]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Booking form ─────────────────────────────────────────────────────────────

interface BookingFormProps {
  onBooked: () => void;
}

function BookingForm({ onBooked }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [servicePlanId, setServicePlanId] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const { data: slots = [], isFetching: loadingSlots } = useQuery({
    queryKey: ["available-slots", date],
    queryFn: () => getAvailableSlots(date),
    enabled: Boolean(date),
  });

  const { data: servicePlans = [] } = useQuery({
    queryKey: ["service-plans"],
    queryFn: listServicePlans,
    select: (plans) => plans.filter((p) => p.isActive),
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      createBooking({
        servicePlanId,
        scheduledDate: date,
        startTime: selectedSlot!.startTime,
        endTime: selectedSlot!.endTime,
      }),
    onSuccess: () => {
      setConfirmed(true);
      onBooked();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível realizar o agendamento."));
    },
  });

  if (confirmed) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <CheckCircle2 className="mb-3 size-12 text-primary" />
          <h3 className="text-lg font-semibold">Sessão agendada!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Você receberá um e-mail de confirmação em breve.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setConfirmed(false);
              setSelectedSlot(null);
              setDate(today);
            }}
          >
            Agendar outra sessão
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-muted-foreground" />
          Agendar sessão
        </CardTitle>
      </CardHeader>
      <Separator className="bg-border/50" />
      <CardContent className="space-y-5 pt-5">
        {/* Date picker */}
        <div className="space-y-2">
          <Label htmlFor="booking-date" className="text-sm">
            Data
          </Label>
          <input
            id="booking-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlot(null);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Available slots */}
        <div className="space-y-2">
          <Label className="text-sm">Horários disponíveis</Label>
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">Carregando horários...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum horário disponível nesta data.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const isSelected =
                  selectedSlot?.startTime === slot.startTime &&
                  selectedSlot?.endTime === slot.endTime;
                return (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background/40 text-foreground hover:bg-accent"
                    }`}
                  >
                    <Clock className="size-3 shrink-0" />
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Service plan */}
        {selectedSlot ? (
          <div className="space-y-2">
            <Label htmlFor="service-plan" className="text-sm">
              Plano de atendimento
            </Label>
            {servicePlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum plano disponível.</p>
            ) : (
              <Select value={servicePlanId} onValueChange={setServicePlanId}>
                <SelectTrigger id="service-plan">
                  <SelectValue placeholder="Selecione um plano..." />
                </SelectTrigger>
                <SelectContent>
                  {servicePlans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {formatPrice(p.price)}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : null}

        {/* Summary + confirm */}
        {selectedSlot && servicePlanId ? (
          <div className="space-y-3">
            <Separator className="bg-border/50" />
            <div className="rounded-lg border border-border bg-background/40 px-4 py-3 text-sm space-y-1.5">
              <p className="font-medium text-foreground">Resumo do agendamento</p>
              <p className="text-muted-foreground">
                Data:{" "}
                <span className="text-foreground">
                  {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </span>
              </p>
              <p className="text-muted-foreground">
                Horário:{" "}
                <span className="text-foreground">
                  {selectedSlot.startTime} – {selectedSlot.endTime}
                </span>
              </p>
              <p className="text-muted-foreground">
                Plano:{" "}
                <span className="text-foreground">
                  {servicePlans.find((p) => p.id === servicePlanId)?.name}
                </span>
              </p>
            </div>

            <Button
              className="w-full font-semibold"
              disabled={bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
              style={{ backgroundColor: "var(--color-theme, #10b981)" }}
            >
              {bookMutation.isPending ? "Agendando..." : "Confirmar agendamento"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface AlunoAgendaPageProps {
  params: Promise<{ "slug-personal": string }>;
}

export default function AlunoAgendaPage({ params }: AlunoAgendaPageProps) {
  use(params);
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
  });

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agende sessões com seu personal trainer.
        </p>
      </div>

      <div className="space-y-6">
        <UpcomingBookings bookings={bookings} />
        <BookingForm onBooked={() => queryClient.invalidateQueries({ queryKey: ["my-bookings"] })} />
      </div>
    </div>
  );
}
