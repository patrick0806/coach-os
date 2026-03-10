"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { TimeSelect } from "@/components/ui/time-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DAY_LABELS, type BulkAvailabilityPayload, type DayOfWeek } from "@/services/availability.service";

const schema = z
  .object({
    startTime: z.string().min(1, "Horário obrigatório"),
    endTime: z.string().min(1, "Horário obrigatório"),
    slotDurationMinutes: z.coerce.number().int().min(15, "Mínimo 15").max(240, "Máximo 240"),
    breakStart: z.string().optional(),
    breakEnd: z.string().optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "O horário de término deve ser após o início",
    path: ["endTime"],
  })
  .refine((data) => Boolean(data.breakStart) === Boolean(data.breakEnd), {
    message: "Informe início e fim da pausa",
    path: ["breakStart"],
  })
  .refine((data) => {
    if (!data.breakStart || !data.breakEnd) {
      return true;
    }

    return (
      data.breakStart >= data.startTime &&
      data.breakEnd <= data.endTime &&
      data.breakStart < data.breakEnd
    );
  }, {
    message: "Pausa deve estar dentro do horário de trabalho",
    path: ["breakStart"],
  });

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface PreviewSlot {
  startTime: string;
  endTime: string;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours * 60) + minutes;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function buildPreviewSlots(values: FormOutput): PreviewSlot[] {
  if (!values.startTime || !values.endTime || !values.slotDurationMinutes) {
    return [];
  }

  const durationMinutes = Number(values.slotDurationMinutes);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return [];
  }

  const slots: PreviewSlot[] = [];
  const start = timeToMinutes(values.startTime);
  const end = timeToMinutes(values.endTime);
  const pauseStart = values.breakStart ? timeToMinutes(values.breakStart) : null;
  const pauseEnd = values.breakEnd ? timeToMinutes(values.breakEnd) : null;

  let current = start;

  while (current + durationMinutes <= end) {
    const currentEnd = current + durationMinutes;

    if (
      pauseStart !== null &&
      pauseEnd !== null &&
      current < pauseEnd &&
      currentEnd > pauseStart
    ) {
      current = pauseEnd;
      continue;
    }

    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(currentEnd),
    });

    current += durationMinutes;
  }

  return slots;
}

interface DisponibilidadeDiaFormProps {
  dayOfWeek: DayOfWeek;
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BulkAvailabilityPayload) => Promise<void>;
}

export function DisponibilidadeDiaForm({
  dayOfWeek,
  open,
  pending = false,
  onOpenChange,
  onSubmit,
}: DisponibilidadeDiaFormProps) {
  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      startTime: "09:00",
      endTime: "18:00",
      slotDurationMinutes: 60,
      breakStart: "",
      breakEnd: "",
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const previewSlots = useMemo(
    () =>
      buildPreviewSlots({
        startTime: watchedValues.startTime ?? "",
        endTime: watchedValues.endTime ?? "",
        slotDurationMinutes: watchedValues.slotDurationMinutes ?? 0,
        breakStart: watchedValues.breakStart ?? "",
        breakEnd: watchedValues.breakEnd ?? "",
      }),
    [
      watchedValues.startTime,
      watchedValues.endTime,
      watchedValues.slotDurationMinutes,
      watchedValues.breakStart,
      watchedValues.breakEnd,
    ],
  );

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Configurar dia — {DAY_LABELS[dayOfWeek]}</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit(async (formValues) => {
            await onSubmit({
              dayOfWeek,
              startTime: formValues.startTime,
              endTime: formValues.endTime,
              slotDurationMinutes: formValues.slotDurationMinutes,
              breakStart: formValues.breakStart || undefined,
              breakEnd: formValues.breakEnd || undefined,
            });
            handleClose();
          })}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-start">Início</Label>
              <Controller
                name="startTime"
                control={form.control}
                render={({ field }) => (
                  <TimeSelect id="bulk-start" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-end">Término</Label>
              <Controller
                name="endTime"
                control={form.control}
                render={({ field }) => (
                  <TimeSelect id="bulk-end" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-duration">Duração do slot (min)</Label>
              <Input
                id="bulk-duration"
                type="number"
                min={15}
                max={240}
                step={15}
                {...form.register("slotDurationMinutes")}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Pausa (opcional)</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-break-start">Início da pausa</Label>
                <Controller
                  name="breakStart"
                  control={form.control}
                  render={({ field }) => (
                    <TimeSelect id="bulk-break-start" value={field.value ?? ""} onChange={field.onChange} />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-break-end">Fim da pausa</Label>
                <Controller
                  name="breakEnd"
                  control={form.control}
                  render={({ field }) => (
                    <TimeSelect id="bulk-break-end" value={field.value ?? ""} onChange={field.onChange} />
                  )}
                />
              </div>
            </div>
          </div>

          {form.formState.errors.endTime ? (
            <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>
          ) : null}
          {form.formState.errors.breakStart ? (
            <p className="text-sm text-destructive">{form.formState.errors.breakStart.message}</p>
          ) : null}
          {form.formState.errors.slotDurationMinutes ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.slotDurationMinutes.message}
            </p>
          ) : null}

          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Preview dos slots</p>
              <p className="text-xs text-muted-foreground">
                {previewSlots.length} {previewSlots.length === 1 ? "slot" : "slots"}
              </p>
            </div>

            {previewSlots.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhum slot gerado com a configuração atual.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {previewSlots.map((slot) => (
                  <span
                    key={`${slot.startTime}-${slot.endTime}`}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {slot.startTime} – {slot.endTime}
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || previewSlots.length === 0}>
              {pending ? "Salvando..." : "Salvar configuração"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
