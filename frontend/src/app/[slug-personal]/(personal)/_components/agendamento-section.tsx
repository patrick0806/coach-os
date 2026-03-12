"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { getPublicAvailableSlots } from "@/services/availability.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgendamentoSectionProps {
  slug: string;
  phoneNumber: string | null;
  personalName: string;
  themeColor: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextDays(count = 7): { date: string; label: string; short: string }[] {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
    const short = d.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
    });
    days.push({ date, label, short });
  }
  return days;
}

function whatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}?text=${encodeURIComponent(message)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AgendamentoSection({
  slug,
  phoneNumber,
  personalName,
  themeColor,
}: AgendamentoSectionProps) {
  const days = getNextDays(7);
  const [selectedDate, setSelectedDate] = useState(days[0].date);

  const { data, isLoading } = useQuery({
    queryKey: ["public-available-slots", slug, selectedDate],
    queryFn: () => getPublicAvailableSlots(slug, selectedDate),
    staleTime: 2 * 60 * 1000,
  });

  const freeSlots = data?.freeSlots ?? [];
  const hasAnyAvailability = freeSlots.length > 0 || (data?.occupiedSlots ?? []).length > 0;

  function handleSlotSelect(startTime: string, endTime: string) {
    if (!phoneNumber) return;
    const selectedDay = days.find((d) => d.date === selectedDate);
    const message = `Olá ${personalName}! Vi seu perfil e tenho interesse em agendar uma sessão no dia ${selectedDay?.label ?? selectedDate} das ${startTime} às ${endTime}. Poderia me dar mais informações?`;
    window.open(whatsAppUrl(phoneNumber, message), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Section header */}
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: themeColor }}
          >
            <CalendarDays className="size-4" />
            Disponibilidade
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Horários disponíveis</h2>
          <p className="mt-3 text-gray-500">
            Selecione um dia para ver os horários em que atendo.
          </p>
        </div>

        {/* Day picker */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {days.map((day) => {
            const isSelected = day.date === selectedDate;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={isSelected ? { backgroundColor: themeColor } : undefined}
              >
                <span className="capitalize">{day.short}</span>
              </button>
            );
          })}
        </div>

        {/* Slots panel */}
        <div className="min-h-[180px] rounded-2xl border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          ) : !hasAnyAvailability ? (
            <div className="flex h-32 flex-col items-center justify-center text-center text-gray-400">
              <CalendarDays className="mb-2 size-8 opacity-40" />
              <p className="text-sm">Sem atendimento neste dia.</p>
            </div>
          ) : freeSlots.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center text-gray-400">
              <Clock className="mb-2 size-8 opacity-40" />
              <p className="text-sm">Todos os horários estão ocupados neste dia.</p>
              <p className="mt-1 text-xs">Tente outro dia da semana.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="mb-4 text-sm text-gray-500">
                {freeSlots.length}{" "}
                {freeSlots.length === 1 ? "horário disponível" : "horários disponíveis"}
                {phoneNumber ? " — clique para entrar em contato" : ""}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {freeSlots.map((slot) => (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    onClick={() => handleSlotSelect(slot.startTime, slot.endTime)}
                    disabled={!phoneNumber}
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                      phoneNumber
                        ? "cursor-pointer hover:shadow-md hover:scale-[1.02]"
                        : "cursor-default"
                    }`}
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>
                      {slot.startTime}
                      {slot.endTime ? ` – ${slot.endTime}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timezone note */}
        <p className="mt-3 text-center text-xs text-gray-400">
          Horários no fuso do profissional.
        </p>
      </div>
    </section>
  );
}
