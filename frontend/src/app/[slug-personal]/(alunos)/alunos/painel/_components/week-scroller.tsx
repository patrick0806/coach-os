"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Moon, Play, X } from "lucide-react";

import { CancelTrainingSessionDialog } from "@/components/shared/cancel-training-session-dialog";
import type { TrainingSession } from "@/services/training-schedule.service";
import { generateNextNDays, getDayNum, getDayAbbr } from "@/lib/date";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeekScrollerProps {
  sessions: TrainingSession[];
  todayStr: string;
  slug: string;
}

function buildExecutarUrl(slug: string, session: TrainingSession): string {
  return `/${slug}/alunos/treinos/${session.workoutPlanId}/executar?trainingSessionId=${session.id}`;
}

// ─── Status Indicator ─────────────────────────────────────────────────────────

type SessionStatus = "pending" | "completed" | "cancelled" | "rest" | "none";

function getStatus(session: TrainingSession | undefined): SessionStatus {
  if (!session) return "none";
  if (session.sessionType === "rest") return "rest";
  return session.status as SessionStatus;
}

function StatusDot({ status, isToday }: { status: SessionStatus; isToday: boolean }) {
  const base = "flex size-8 items-center justify-center rounded-full transition-all";

  if (status === "rest") {
    return (
      <div className={`${base} bg-white/8`}>
        <Moon className="size-3.5 text-muted-foreground" />
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className={`${base} bg-emerald-500/20`}>
        <Check className="size-3.5 text-emerald-400" />
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className={`${base} bg-red-500/15`}>
        <X className="size-3.5 text-red-400" />
      </div>
    );
  }

  if (status === "pending") {
    if (isToday) {
      return (
        <div className={`${base} bg-primary/30 ring-1 ring-primary/60`}>
          <Play className="size-3 fill-primary text-primary" />
        </div>
      );
    }
    return (
      <div className={`${base} bg-primary/20`}>
        <span className="size-2.5 rounded-full bg-primary" />
      </div>
    );
  }

  // none
  return (
    <div className={`${base} border border-white/8 bg-transparent`}>
      <span className="size-1.5 rounded-full bg-white/20" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WeekScroller({ sessions, todayStr, slug }: WeekScrollerProps) {
  const router = useRouter();
  const [cancelSession, setCancelSession] = useState<TrainingSession | null>(null);

  const days = generateNextNDays(todayStr, 7);
  const sessionMap = new Map(sessions.map((s) => [s.scheduledDate, s]));

  function handleDayClick(dateStr: string, session: TrainingSession | undefined) {
    if (!session || session.sessionType === "rest" || session.status !== "pending") return;

    if (dateStr === todayStr && session.workoutPlanId) {
      router.push(buildExecutarUrl(slug, session));
      return;
    }

    // Future pending session → open cancel dialog
    if (dateStr > todayStr) {
      setCancelSession(session);
    }
  }

  return (
    <>
      <div className="premium-glass rounded-3xl p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Próximos treinos
        </p>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map((dateStr) => {
            const isToday = dateStr === todayStr;
            const session = sessionMap.get(dateStr);
            const status = getStatus(session);
            const isClickable =
              session &&
              session.sessionType !== "rest" &&
              session.status === "pending";

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleDayClick(dateStr, session)}
                disabled={!isClickable}
                className={`
                  flex min-w-[52px] flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5
                  transition-all duration-200
                  ${isToday
                    ? "bg-primary/15 ring-1 ring-primary/40"
                    : "bg-white/4"}
                  ${isClickable
                    ? "cursor-pointer hover:scale-105 hover:bg-white/10"
                    : "cursor-default"}
                `}
                title={
                  isClickable && isToday
                    ? "Iniciar treino"
                    : isClickable
                    ? "Clique para cancelar"
                    : undefined
                }
              >
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {getDayAbbr(dateStr)}
                </span>

                <span
                  className={`text-sm font-semibold ${
                    isToday ? "text-primary-foreground" : "text-foreground/70"
                  }`}
                >
                  {getDayNum(dateStr)}
                </span>

                <StatusDot status={status} isToday={isToday} />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Play className="size-2.5" />
            Hoje — toque para iniciar
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary" />
            Pendente
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Concluído
          </span>
          <span className="flex items-center gap-1">
            <Moon className="size-2.5" />
            Descanso
          </span>
        </div>
      </div>

      <CancelTrainingSessionDialog
        session={cancelSession}
        open={!!cancelSession}
        onOpenChange={(open) => { if (!open) setCancelSession(null); }}
      />
    </>
  );
}
