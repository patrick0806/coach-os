"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { TimeSelect } from "@/components/ui/time-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBookingSeries,
  createPersonalBooking,
} from "@/services/bookings.service";
import { listServicePlans } from "@/services/service-plans.service";
import { listStudents } from "@/services/students.service";

const MAX_SERIES_DAYS = 183;

const schema = z
  .object({
    mode: z.enum(["single", "recurring"]),
    studentId: z.string().uuid("Selecione um aluno"),
    servicePlanId: z.string().uuid("Aluno sem plano ativo"),
    startTime: z.string().min(1, "Horário obrigatório"),
    endTime: z.string().min(1, "Horário obrigatório"),
    notes: z.string().max(500, "Máximo de 500 caracteres").optional(),
    scheduledDate: z.string().optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
    seriesStartDate: z.string().optional(),
    seriesEndDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime >= data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "O horário de término deve ser após o início",
      });
    }

    if (data.mode === "single") {
      if (!data.scheduledDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledDate"],
          message: "Selecione a data da sessão",
        });
      }
      return;
    }

    if (data.daysOfWeek.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daysOfWeek"],
        message: "Selecione ao menos um dia da semana",
      });
    }

    if (!data.seriesStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seriesStartDate"],
        message: "Informe a data de início",
      });
    }

    if (!data.seriesEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seriesEndDate"],
        message: "Informe a data de término",
      });
      return;
    }

    if (data.seriesStartDate && data.seriesEndDate < data.seriesStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seriesEndDate"],
        message: "A data final deve ser igual ou posterior à inicial",
      });
      return;
    }

    if (data.seriesStartDate && data.seriesEndDate) {
      const start = new Date(`${data.seriesStartDate}T00:00:00.000Z`);
      const end = new Date(`${data.seriesEndDate}T00:00:00.000Z`);
      const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > MAX_SERIES_DAYS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["seriesEndDate"],
          message: "Período máximo para recorrência é de 6 meses",
        });
      }
    }
  });

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const WEEK_DAY_OPTIONS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 0, label: "Dom" },
] as const;
const EMPTY_DAYS: number[] = [];

function toDateLabel(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00.000Z`).toLocaleDateString("pt-BR");
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day, 12, 0, 0);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildRecurringDates(daysOfWeek: number[], startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || daysOfWeek.length === 0) {
    return [];
  }

  const selectedDays = new Set(daysOfWeek);
  const dates: string[] = [];
  let current = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (current.getTime() <= end.getTime()) {
    if (selectedDays.has(current.getUTCDay())) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, "0");
      const day = String(current.getUTCDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }
    current = new Date(current);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSessionDialog({ open, onOpenChange }: AddSessionDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: "single",
      studentId: "",
      servicePlanId: "",
      startTime: "08:00",
      endTime: "09:00",
      notes: "",
      scheduledDate: "",
      daysOfWeek: [],
      seriesStartDate: "",
      seriesEndDate: "",
    },
  });

  const mode = useWatch({ control: form.control, name: "mode" }) ?? "single";
  const studentId = useWatch({ control: form.control, name: "studentId" }) ?? "";
  const watchedDaysOfWeek = useWatch({ control: form.control, name: "daysOfWeek" });
  const daysOfWeek = watchedDaysOfWeek ?? EMPTY_DAYS;
  const seriesStartDate = useWatch({ control: form.control, name: "seriesStartDate" }) ?? "";
  const seriesEndDate = useWatch({ control: form.control, name: "seriesEndDate" }) ?? "";
  const scheduledDate = useWatch({ control: form.control, name: "scheduledDate" }) ?? "";

  const studentsQuery = useQuery({
    queryKey: ["students", "agenda-create"],
    queryFn: () => listStudents({ page: 1, size: 200 }),
    enabled: open,
  });

  const plansQuery = useQuery({
    queryKey: ["service-plans", "agenda-create"],
    queryFn: listServicePlans,
    enabled: open,
  });

  const recurringDates = useMemo(
    () => buildRecurringDates(daysOfWeek, seriesStartDate, seriesEndDate),
    [daysOfWeek, seriesStartDate, seriesEndDate],
  );

  const createSingleMutation = useMutation({
    mutationFn: createPersonalBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Sessão criada com sucesso.");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar a sessão."));
    },
  });

  const createRecurringMutation = useMutation({
    mutationFn: createBookingSeries,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-series"] });
      toast.success(`${data.bookingsCreated} sessões recorrentes criadas.`);
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar a recorrência."));
    },
  });

  const isSubmitting = createSingleMutation.isPending || createRecurringMutation.isPending;
  const activePlans = (plansQuery.data ?? []).filter((plan) => plan.isActive);
  const students = studentsQuery.data?.content ?? [];
  const selectedStudent = students.find((student) => student.id === studentId) ?? null;
  const selectedStudentPlan = useMemo(
    () => activePlans.find((plan) => plan.id === selectedStudent?.servicePlanId) ?? null,
    [activePlans, selectedStudent?.servicePlanId],
  );

  useEffect(() => {
    if (!studentId) {
      form.setValue("servicePlanId", "", { shouldValidate: true });
      return;
    }

    if (selectedStudentPlan) {
      form.setValue("servicePlanId", selectedStudentPlan.id, { shouldValidate: true });
      return;
    }

    form.setValue("servicePlanId", "", { shouldValidate: true });
  }, [form, selectedStudentPlan, studentId]);

  const canSubmit =
    !isSubmitting &&
    Boolean(selectedStudentPlan) &&
    (mode === "single" || recurringDates.length > 0);

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  function toggleDay(day: number) {
    const currentDays = form.getValues("daysOfWeek");
    const next = currentDays.includes(day)
      ? currentDays.filter((value) => value !== day)
      : [...currentDays, day].sort((a, b) => a - b);

    form.setValue("daysOfWeek", next, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar sessão</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            if (values.mode === "single") {
              createSingleMutation.mutate({
                studentId: values.studentId,
                servicePlanId: values.servicePlanId,
                scheduledDate: values.scheduledDate!,
                startTime: values.startTime,
                endTime: values.endTime,
                notes: values.notes?.trim() || undefined,
              });
              return;
            }

            createRecurringMutation.mutate({
              studentId: values.studentId,
              servicePlanId: values.servicePlanId,
              daysOfWeek: values.daysOfWeek,
              startTime: values.startTime,
              endTime: values.endTime,
              seriesStartDate: values.seriesStartDate!,
              seriesEndDate: values.seriesEndDate!,
              notes: values.notes?.trim() || undefined,
            });
          })}
        >
          <div className="inline-flex rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={mode === "single" ? "default" : "ghost"}
              size="sm"
              onClick={() => form.setValue("mode", "single", { shouldValidate: true })}
            >
              Sessão única
            </Button>
            <Button
              type="button"
              variant={mode === "recurring" ? "default" : "ghost"}
              size="sm"
              onClick={() => form.setValue("mode", "recurring", { shouldValidate: true })}
            >
              Recorrente
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Controller
                name="studentId"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={studentsQuery.isLoading ? "Carregando..." : "Selecione o aluno"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.studentId ? (
                <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Plano do aluno</Label>
              <div className="min-h-[72px] rounded-lg border bg-muted/20 p-3">
                {!studentId ? (
                  <p className="text-sm text-muted-foreground">Selecione um aluno para carregar o plano.</p>
                ) : plansQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando plano...</p>
                ) : selectedStudentPlan ? (
                  <div>
                    <p className="font-medium">{selectedStudentPlan.name}</p>
                    {selectedStudentPlan.description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selectedStudentPlan.description}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">Este aluno não possui plano ativo vinculado.</p>
                )}
              </div>
            </div>
          </div>

          {mode === "single" ? (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {scheduledDate
                        ? format(parseIsoDate(scheduledDate)!, "PPP", { locale: ptBR })
                        : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseIsoDate(scheduledDate)}
                      onSelect={(date) =>
                        form.setValue("scheduledDate", date ? formatIsoDate(date) : "", {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.scheduledDate ? (
                  <p className="text-sm text-destructive">{form.formState.errors.scheduledDate.message}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Controller
                    name="startTime"
                    control={form.control}
                    render={({ field }) => (
                      <TimeSelect value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Controller
                    name="endTime"
                    control={form.control}
                    render={({ field }) => (
                      <TimeSelect value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <div className="space-y-2">
                <Label>Dias da semana</Label>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 rounded-lg border p-2",
                    form.formState.errors.daysOfWeek ? "border-destructive" : "border-border",
                  )}
                >
                  {WEEK_DAY_OPTIONS.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      size="sm"
                      variant={daysOfWeek.includes(day.value) ? "default" : "outline"}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                {form.formState.errors.daysOfWeek ? (
                  <p className="text-sm text-destructive">{form.formState.errors.daysOfWeek.message}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Controller
                    name="startTime"
                    control={form.control}
                    render={({ field }) => (
                      <TimeSelect value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Controller
                    name="endTime"
                    control={form.control}
                    render={({ field }) => (
                      <TimeSelect value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !seriesStartDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {seriesStartDate
                          ? format(parseIsoDate(seriesStartDate)!, "P", { locale: ptBR })
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseIsoDate(seriesStartDate)}
                        onSelect={(date) =>
                          form.setValue("seriesStartDate", date ? formatIsoDate(date) : "", {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.seriesStartDate ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.seriesStartDate.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !seriesEndDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {seriesEndDate
                          ? format(parseIsoDate(seriesEndDate)!, "P", { locale: ptBR })
                          : "Selecione"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseIsoDate(seriesEndDate)}
                        onSelect={(date) =>
                          form.setValue("seriesEndDate", date ? formatIsoDate(date) : "", {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.seriesEndDate ? (
                    <p className="text-sm text-destructive">{form.formState.errors.seriesEndDate.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-3">
                {recurringDates.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Serão criadas <strong>{recurringDates.length}</strong> sessões entre{" "}
                    <strong>{toDateLabel(recurringDates[0])}</strong> e{" "}
                    <strong>{toDateLabel(recurringDates[recurringDates.length - 1])}</strong>.
                  </p>
                ) : (
                  <p className="text-sm text-amber-700">
                    Nenhuma sessão será criada com os dias e período informados.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="session-notes">Notas (opcional)</Label>
            <Textarea
              id="session-notes"
              rows={3}
              placeholder="Observações para esta sessão"
              {...form.register("notes")}
            />
            {form.formState.errors.notes ? (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            ) : null}
          </div>

          {form.formState.errors.endTime ? (
            <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting
                ? "Salvando..."
                : mode === "single"
                  ? "Criar sessão"
                  : "Criar sessões recorrentes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
