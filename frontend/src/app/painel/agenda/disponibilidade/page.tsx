"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Link from "next/link";

import { TimeSelect } from "@/components/ui/time-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createSlot,
  copyAvailability,
  bulkAvailability,
  DAY_LABELS,
  DAYS_ORDER,
  deleteSlot,
  listAvailability,
  updateSlot,
  type AvailabilitySlot,
  type DayOfWeek,
} from "@/services/availability.service";
import { DisponibilidadeDiaForm } from "./_components/disponibilidade-dia-form";
import { CopiarDisponibilidadeModal } from "./_components/copiar-disponibilidade-modal";

// ─── Add Slot Dialog ──────────────────────────────────────────────────────────

const slotSchema = z
  .object({
    startTime: z.string().min(1, "Horário obrigatório"),
    endTime: z.string().min(1, "Horário obrigatório"),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: "O horário de início deve ser anterior ao término",
    path: ["endTime"],
  });

type SlotFormValues = z.infer<typeof slotSchema>;

interface AddSlotDialogProps {
  dayOfWeek: DayOfWeek;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

function AddSlotDialog({ dayOfWeek, open, onOpenChange, onAdded }: AddSlotDialogProps) {
  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: { startTime: "", endTime: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: SlotFormValues) =>
      createSlot({ dayOfWeek, startTime: values.startTime, endTime: values.endTime }),
    onSuccess: () => {
      toast.success("Horário adicionado.");
      onAdded();
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível adicionar o horário."));
    },
  });

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Adicionar horário — {DAY_LABELS[dayOfWeek]}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slot-start">Início</Label>
              <Controller
                name="startTime"
                control={form.control}
                render={({ field }) => (
                  <TimeSelect id="slot-start" value={field.value} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.startTime ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startTime.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slot-end">Término</Label>
              <Controller
                name="endTime"
                control={form.control}
                render={({ field }) => (
                  <TimeSelect id="slot-end" value={field.value} onChange={field.onChange} />
                )}
              />
              {form.formState.errors.endTime ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endTime.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Slot Row ─────────────────────────────────────────────────────────────────

interface SlotRowProps {
  slot: AvailabilitySlot;
  onToggle: () => void;
  onDelete: () => void;
  isTogglingId: string | null;
}

function SlotRow({ slot, onToggle, onDelete, isTogglingId }: SlotRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={isTogglingId === slot.id}
          aria-label={slot.isActive ? "Desativar slot" : "Ativar slot"}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${
            slot.isActive ? "bg-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
              slot.isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${slot.isActive ? "text-gray-900" : "text-gray-400 line-through"}`}
        >
          {slot.startTime} – {slot.endTime}
        </span>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label="Remover horário"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DisponibilidadePage() {
  const queryClient = useQueryClient();
  const [addingDay, setAddingDay] = useState<DayOfWeek | null>(null);
  const [configuringDay, setConfiguringDay] = useState<DayOfWeek | null>(null);
  const [copyingDay, setCopyingDay] = useState<DayOfWeek | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<AvailabilitySlot | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: listAvailability,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Horário removido.");
      setDeletingSlot(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível remover o horário."));
    },
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAvailability,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success(
        `${data.slotsCreated} ${data.slotsCreated === 1 ? "slot criado" : "slots criados"} em ${DAY_LABELS[data.dayOfWeek]}.`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível configurar o dia."));
    },
  });

  const copyMutation = useMutation({
    mutationFn: copyAvailability,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success(
        `${data.totalSlotsCreated} slots copiados para ${data.copiedToDays.length} dia(s).`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível copiar a disponibilidade."));
    },
  });

  async function handleToggle(slot: AvailabilitySlot) {
    setTogglingId(slot.id);
    try {
      await updateSlot(slot.id, { isActive: !slot.isActive });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível alterar o horário."));
    } finally {
      setTogglingId(null);
    }
  }

  const slotsByDay = DAYS_ORDER.reduce<Record<number, AvailabilitySlot[]>>((acc, day) => {
    acc[day] = slots
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const daySlotCounts = DAYS_ORDER.reduce<Record<number, number>>((acc, day) => {
    acc[day] = slotsByDay[day]?.length ?? 0;
    return acc;
  }, {});

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <div className="mb-6">
          <Link
            href="/painel/agenda"
            className="-ml-1 mb-4 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            Agenda
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Disponibilidade</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure os horários em que você atende por dia da semana.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS_ORDER.map((day) => {
              const daySlots = slotsByDay[day] ?? [];
              return (
                <Card key={day}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                      {DAY_LABELS[day]}
                      {daySlots.length > 0 ? (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          ({daySlots.length} {daySlots.length === 1 ? "horário" : "horários"})
                        </span>
                      ) : null}
                    </CardTitle>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs text-gray-500"
                        onClick={() => setConfiguringDay(day)}
                      >
                        Configurar dia
                      </Button>
                      {daySlots.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs text-gray-500"
                          onClick={() => setCopyingDay(day)}
                        >
                          Copiar para outros dias
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs text-gray-500"
                        onClick={() => setAddingDay(day)}
                      >
                        <Plus className="size-3.5" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-gray-400">Nenhum horário configurado.</p>
                    ) : (
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <SlotRow
                            key={slot.id}
                            slot={slot}
                            onToggle={() => handleToggle(slot)}
                            onDelete={() => setDeletingSlot(slot)}
                            isTogglingId={togglingId}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {addingDay !== null ? (
        <AddSlotDialog
          dayOfWeek={addingDay}
          open={true}
          onOpenChange={(open) => !open && setAddingDay(null)}
          onAdded={() => {
            queryClient.invalidateQueries({ queryKey: ["availability"] });
            setAddingDay(null);
          }}
        />
      ) : null}

      {configuringDay !== null ? (
        <DisponibilidadeDiaForm
          dayOfWeek={configuringDay}
          open={true}
          pending={bulkMutation.isPending}
          onOpenChange={(open) => !open && setConfiguringDay(null)}
          onSubmit={async (payload) => {
            await bulkMutation.mutateAsync(payload);
            setConfiguringDay(null);
          }}
        />
      ) : null}

      {copyingDay !== null ? (
        <CopiarDisponibilidadeModal
          sourceDay={copyingDay}
          open={true}
          pending={copyMutation.isPending}
          daySlotCounts={daySlotCounts}
          onOpenChange={(open) => !open && setCopyingDay(null)}
          onSubmit={async (payload) => {
            await copyMutation.mutateAsync(payload);
            setCopyingDay(null);
          }}
        />
      ) : null}

      <AlertDialog
        open={Boolean(deletingSlot)}
        onOpenChange={(open) => !open && setDeletingSlot(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover horário</AlertDialogTitle>
            <AlertDialogDescription>
              Remover o horário{" "}
              <strong>
                {deletingSlot?.startTime} – {deletingSlot?.endTime}
              </strong>{" "}
              de {deletingSlot ? DAY_LABELS[deletingSlot.dayOfWeek] : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingSlot && deleteMutation.mutate(deletingSlot.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
