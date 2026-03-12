"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CalendarDays, Clock, Dumbbell, Moon, Save, Wifi, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeSelect } from "@/components/ui/time-select";
import { CancelTrainingSessionDialog } from "@/components/shared/cancel-training-session-dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { getStudentWorkoutPlans } from "@/services/workout-plans.service";
import { listAvailability } from "@/services/availability.service";
import type { AvailabilitySlot } from "@/services/availability.service";
import { getScheduleRules, listTrainingSessions, upsertScheduleRules } from "@/services/training-schedule.service";
import type { ScheduleRule, TrainingSession } from "@/services/training-schedule.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { label: "Segunda-feira", short: "Seg", dayOfWeek: 1 },
  { label: "Terça-feira", short: "Ter", dayOfWeek: 2 },
  { label: "Quarta-feira", short: "Qua", dayOfWeek: 3 },
  { label: "Quinta-feira", short: "Qui", dayOfWeek: 4 },
  { label: "Sexta-feira", short: "Sex", dayOfWeek: 5 },
  { label: "Sábado", short: "Sáb", dayOfWeek: 6 },
  { label: "Domingo", short: "Dom", dayOfWeek: 0 },
];

type SessionType = "online" | "presential" | "rest";

interface DayConfig {
  sessionType: SessionType;
  workoutPlanId: string;
  startTime: string;
  endTime: string;
}

type WeekConfig = Record<number, DayConfig>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultWeekConfig(): WeekConfig {
  return Object.fromEntries(
    DAYS.map((d) => [d.dayOfWeek, { sessionType: "rest", workoutPlanId: "", startTime: "", endTime: "" }]),
  );
}

function rulesToWeekConfig(rules: ScheduleRule[]): WeekConfig {
  const config = getDefaultWeekConfig();
  for (const rule of rules) {
    config[rule.dayOfWeek] = {
      sessionType: rule.sessionType,
      workoutPlanId: rule.workoutPlanId ?? "",
      startTime: rule.startTime ?? "",
      endTime: rule.endTime ?? "",
    };
  }
  return config;
}

// Returns whether a presential [startTime, endTime] is covered by availability slots.
// "no-slots" = personal has no slots for that day (no restriction to show)
// "covered"  = fits within a slot
// "outside"  = slots exist but none covers the requested range
function checkAvailabilityCoverage(
  slots: AvailabilitySlot[],
  dayOfWeek: number,
  startTime: string,
  endTime: string,
): "covered" | "outside" | "no-slots" {
  const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  if (daySlots.length === 0) return "no-slots";
  const covered = daySlots.some((s) => s.startTime <= startTime && s.endTime >= endTime);
  return covered ? "covered" : "outside";
}

const SESSION_TYPE_STYLES: Record<SessionType, { bg: string; badge: string; icon: React.ReactNode }> = {
  rest: {
    bg: "bg-gray-50 border-gray-100",
    badge: "bg-gray-100 text-gray-500",
    icon: <Moon className="size-3.5" />,
  },
  online: {
    bg: "bg-blue-50 border-blue-100",
    badge: "bg-blue-100 text-blue-600",
    icon: <Wifi className="size-3.5" />,
  },
  presential: {
    bg: "bg-emerald-50 border-emerald-100",
    badge: "bg-emerald-100 text-emerald-600",
    icon: <Dumbbell className="size-3.5" />,
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface StudentSchedulePlannerProps {
  studentId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentSchedulePlanner({ studentId }: StudentSchedulePlannerProps) {
  const queryClient = useQueryClient();
  const [weekConfig, setWeekConfig] = useState<WeekConfig>(getDefaultWeekConfig);
  const initialized = useRef(false);
  const [cancelSession, setCancelSession] = useState<TrainingSession | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const rulesQuery = useQuery({
    queryKey: ["schedule-rules", studentId],
    queryFn: () => getScheduleRules(studentId),
  });

  const plansQuery = useQuery({
    queryKey: ["workout-plans", "student", studentId],
    queryFn: () => getStudentWorkoutPlans(studentId),
  });

  const availabilityQuery = useQuery({
    queryKey: ["availability"],
    queryFn: listAvailability,
  });

  const upcomingSessionsQuery = useQuery({
    queryKey: ["training-sessions", "student", studentId, today],
    queryFn: () => listTrainingSessions(studentId, { from: today, to: in14Days }),
  });

  // Initialize local state from server data (only on first load)
  useEffect(() => {
    if (rulesQuery.data && !initialized.current) {
      setWeekConfig(rulesToWeekConfig(rulesQuery.data));
      initialized.current = true;
    }
  }, [rulesQuery.data]);

  const mutation = useMutation({
    mutationFn: (config: WeekConfig) => {
      const days = DAYS.map((d) => {
        const day = config[d.dayOfWeek];
        return {
          dayOfWeek: d.dayOfWeek,
          sessionType: day.sessionType,
          workoutPlanId: day.sessionType !== "rest" ? (day.workoutPlanId || null) : null,
          startTime: day.sessionType === "presential" ? (day.startTime || null) : null,
          endTime: day.sessionType === "presential" ? (day.endTime || null) : null,
        };
      });
      return upsertScheduleRules(studentId, { days });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-rules", studentId] });
      toast.success("Planejador semanal salvo com sucesso!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar o planejador."));
    },
  });

  function updateDay(dayOfWeek: number, updates: Partial<DayConfig>) {
    setWeekConfig((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], ...updates },
    }));
  }

  if (rulesQuery.isLoading || plansQuery.isLoading) {
    return (
      <div className="space-y-3">
        {DAYS.map((d) => (
          <Skeleton key={d.dayOfWeek} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const workoutPlans = plansQuery.data ?? [];
  const availabilitySlots = availabilityQuery.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>Configure os treinos de cada dia da semana</span>
        </div>
        <Button
          size="sm"
          onClick={() => mutation.mutate(weekConfig)}
          disabled={mutation.isPending}
          className="gap-2"
        >
          <Save className="size-3.5" />
          {mutation.isPending ? "Salvando..." : "Salvar planejador"}
        </Button>
      </div>

      {/* Day cards */}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const config = weekConfig[day.dayOfWeek];
          const styles = SESSION_TYPE_STYLES[config.sessionType];
          const isTraining = config.sessionType !== "rest";
          const isPresential = config.sessionType === "presential";

          // Real-time availability validation for presential sessions
          const availabilityStatus =
            isPresential && config.startTime && config.endTime
              ? checkAvailabilityCoverage(
                availabilitySlots,
                day.dayOfWeek,
                config.startTime,
                config.endTime,
              )
              : null;

          return (
            <Card
              key={day.dayOfWeek}
              className={`border transition-colors duration-200 ${styles.bg} ${availabilityStatus === "outside" ? "border-amber-300" : ""
                }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Day label */}
                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                    >
                      {styles.icon}
                      {day.short}
                    </span>
                  </div>

                  {/* Session type selector */}
                  <div className="w-44 shrink-0">
                    <Select
                      value={config.sessionType}
                      onValueChange={(value: SessionType) =>
                        updateDay(day.dayOfWeek, {
                          sessionType: value,
                          workoutPlanId: value === "rest" ? "" : config.workoutPlanId,
                          startTime: value === "presential" ? config.startTime : "",
                          endTime: value === "presential" ? config.endTime : "",
                        })
                      }
                    >
                      <SelectTrigger className="h-9 bg-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest">
                          <span className="flex items-center gap-2">
                            <Moon className="size-3.5 text-gray-400" />
                            Descanso
                          </span>
                        </SelectItem>
                        <SelectItem value="online">
                          <span className="flex items-center gap-2">
                            <Wifi className="size-3.5 text-blue-500" />
                            Treino Online
                          </span>
                        </SelectItem>
                        <SelectItem value="presential">
                          <span className="flex items-center gap-2">
                            <Dumbbell className="size-3.5 text-emerald-500" />
                            Treino Presencial
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Workout plan selector */}
                  {isTraining ? (
                    <div className="min-w-0 flex-1">
                      <Select
                        value={config.workoutPlanId || ""}
                        onValueChange={(value) =>
                          updateDay(day.dayOfWeek, { workoutPlanId: value })
                        }
                      >
                        <SelectTrigger className="h-9 w-full bg-white text-sm">
                          <SelectValue placeholder="Selecione o treino..." />
                        </SelectTrigger>
                        <SelectContent>
                          {workoutPlans.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Nenhum treino atribuído ao aluno
                            </div>
                          ) : (
                            workoutPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Dia de descanso</p>
                    </div>
                  )}

                  {/* Time range selector (presential only) */}
                  {isPresential ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <div className="w-32">
                        <TimeSelect
                          value={config.startTime || ""}
                          onChange={(value) => updateDay(day.dayOfWeek, { startTime: value })}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">até</span>
                      <div className="w-32">
                        <TimeSelect
                          value={config.endTime || ""}
                          onChange={(value) => updateDay(day.dayOfWeek, { endTime: value })}
                        />
                      </div>
                      {availabilityStatus === "outside" && (
                        <div className="flex w-full items-center gap-1 pl-6 text-xs text-amber-600 sm:w-auto sm:pl-0">
                          <AlertTriangle className="size-3.5 shrink-0" />
                          <span>Fora da disponibilidade</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-gray-300" />
          Descanso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-400" />
          Online
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400" />
          Presencial
        </span>
      </div>

      {/* ─── Próximas sessões ──────────────────────────────────────────────── */}
      <UpcomingSessionsList
        sessions={upcomingSessionsQuery.data ?? []}
        isLoading={upcomingSessionsQuery.isLoading}
        onCancel={setCancelSession}
      />

      <CancelTrainingSessionDialog
        session={cancelSession}
        showNotifyStudent
        open={!!cancelSession}
        onOpenChange={(open) => { if (!open) setCancelSession(null); }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["training-sessions", "student", studentId] });
        }}
      />
    </div>
  );
}

// ─── Upcoming Sessions ────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  completed: { label: "Concluído", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

function UpcomingSessionsList({
  sessions,
  isLoading,
  onCancel,
}: {
  sessions: TrainingSession[];
  isLoading: boolean;
  onCancel: (session: TrainingSession) => void;
}) {
  const trainingSessions = sessions.filter((s) => s.sessionType !== "rest");

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CalendarDays className="size-4 text-muted-foreground" />
          Próximas sessões (14 dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : trainingSessions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma sessão de treino nos próximos 14 dias.
          </p>
        ) : (
          <div className="space-y-2">
            {trainingSessions.map((session) => {
              const formattedDate = new Date(`${session.scheduledDate}T00:00:00`).toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
              });
              const badge = STATUS_BADGE[session.status] ?? { label: session.status, variant: "outline" as const };

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium capitalize">{formattedDate}</span>
                      {session.startTime ? (
                        <span className="text-xs text-muted-foreground">
                          {session.startTime}
                          {session.endTime ? ` – ${session.endTime}` : ""}
                        </span>
                      ) : null}
                    </div>
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                  </div>

                  {session.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                      onClick={() => onCancel(session)}
                    >
                      <XCircle className="size-3.5" />
                      Cancelar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
