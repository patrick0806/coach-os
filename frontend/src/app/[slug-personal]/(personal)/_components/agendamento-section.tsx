"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { getPublicWeeklyAvailability, DAY_LABELS, DAYS_ORDER } from "@/services/availability.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgendamentoSectionProps {
  slug: string;
  phoneNumber: string | null;
  personalName: string;
  themeColor: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function whatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}?text=${encodeURIComponent(message)}`;
}

function getDayPrefix(day: number): string {
  return [0, 6].includes(day) ? "no" : "na";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AgendamentoSection({
  slug,
  phoneNumber,
  personalName,
  themeColor,
}: AgendamentoSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["public-weekly-availability", slug],
    queryFn: () => getPublicWeeklyAvailability(slug),
    staleTime: 5 * 60 * 1000,
  });

  const daysAvailability = data?.days ?? [];
  const hasAnyAvailability = daysAvailability.some(d => d.freeSlots.length > 0 || d.occupiedSlots.length > 0);

  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(null);

  // Default to the first day with free slots, or Monday if none
  const firstAvailableDay = DAYS_ORDER.find(d =>
    daysAvailability.find(da => da.dayOfWeek === d)?.freeSlots.length
  ) ?? DAYS_ORDER[0];

  const activeDayIndex = selectedDayOfWeek !== null ? selectedDayOfWeek : firstAvailableDay;
  const activeDayDto = daysAvailability.find(d => d.dayOfWeek === activeDayIndex);

  const freeSlots = activeDayDto?.freeSlots ?? [];

  function handleSlotSelect(startTime: string, endTime: string) {
    if (!phoneNumber) return;
    const dayLabel = DAY_LABELS[activeDayIndex as keyof typeof DAY_LABELS];
    const prefix = getDayPrefix(activeDayIndex);
    const message = `Olá ${personalName}! Vi seu perfil e tenho interesse em agendar uma sessão ${prefix} ${dayLabel} das ${startTime} às ${endTime}. Poderia me dar mais informações?`;
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
            Disponibilidade Padrão
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Horários disponíveis</h2>
          <p className="mt-3 text-gray-500">
            Selecione um dia da semana para ver os horários em que atendo.
          </p>
        </div>

        {/* Day picker */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {DAYS_ORDER.map((dayOfWeek) => {
            const isSelected = dayOfWeek === activeDayIndex;
            const label = DAY_LABELS[dayOfWeek as keyof typeof DAY_LABELS];
            const short = label.substring(0, 3);

            return (
              <button
                key={dayOfWeek}
                onClick={() => setSelectedDayOfWeek(dayOfWeek)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${isSelected
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                style={isSelected ? { backgroundColor: themeColor } : undefined}
              >
                <span className="capitalize">{short}</span>
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
          ) : !hasAnyAvailability || !activeDayDto ? (
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
                    className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${phoneNumber
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
