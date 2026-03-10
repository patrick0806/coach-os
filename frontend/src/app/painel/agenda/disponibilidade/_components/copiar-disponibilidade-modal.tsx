"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DAY_LABELS,
  DAYS_ORDER,
  type CopyAvailabilityPayload,
  type DayOfWeek,
} from "@/services/availability.service";

interface CopiarDisponibilidadeModalProps {
  sourceDay: DayOfWeek;
  open: boolean;
  pending?: boolean;
  daySlotCounts: Record<number, number>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CopyAvailabilityPayload) => Promise<void>;
}

export function CopiarDisponibilidadeModal({
  sourceDay,
  open,
  pending = false,
  daySlotCounts,
  onOpenChange,
  onSubmit,
}: CopiarDisponibilidadeModalProps) {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  const availableDays = useMemo(
    () => DAYS_ORDER.filter((day) => day !== sourceDay),
    [sourceDay],
  );

  async function handleConfirm() {
    if (selectedDays.length === 0) {
      return;
    }

    await onSubmit({
      sourceDayOfWeek: sourceDay,
      targetDays: selectedDays,
    });
    setSelectedDays([]);
    onOpenChange(false);
  }

  function toggleDay(day: DayOfWeek) {
    setSelectedDays((current) => (
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    ));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Copiar disponibilidade — {DAY_LABELS[sourceDay]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecione os dias destino. Os horários existentes nesses dias serão substituídos.
          </p>

          <div className="grid gap-2">
            {availableDays.map((day) => (
              <label
                key={day}
                className="flex cursor-pointer items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="font-medium">{DAY_LABELS[day]}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {daySlotCounts[day] ?? 0} slot(s) atuais
                </span>
              </label>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Preview resumido</p>
            {selectedDays.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Nenhum dia selecionado.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {selectedDays.map((day) => (
                  <li key={day}>
                    {DAY_LABELS[day]}: {daySlotCounts[day] ?? 0} slot(s) serão substituídos
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedDays([]);
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={pending || selectedDays.length === 0}
            onClick={handleConfirm}
          >
            {pending ? "Copiando..." : "Copiar configuração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
