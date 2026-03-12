import { Check, Moon, X } from "lucide-react";

import type { TrainingSession } from "@/services/training-schedule.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeekScrollerProps {
  sessions: TrainingSession[];
  todayStr: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_ABBR = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function generateNext7Days(todayStr: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${todayStr}T00:00:00`);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatDayNum(dateStr: string): string {
  return String(new Date(`${dateStr}T00:00:00`).getDate()).padStart(2, "0");
}

function getDayAbbr(dateStr: string): string {
  return DAY_ABBR[new Date(`${dateStr}T00:00:00`).getDay()];
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

export function WeekScroller({ sessions, todayStr }: WeekScrollerProps) {
  const days = generateNext7Days(todayStr);
  const sessionMap = new Map(sessions.map((s) => [s.scheduledDate, s]));

  return (
    <div className="premium-glass rounded-3xl p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
        Sua semana
      </p>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((dateStr) => {
          const isToday = dateStr === todayStr;
          const session = sessionMap.get(dateStr);
          const status = getStatus(session);

          return (
            <div
              key={dateStr}
              className={`
                flex min-w-[52px] flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5
                transition-all duration-200
                ${isToday
                  ? "bg-primary/15 ring-1 ring-primary/40"
                  : "bg-white/4 hover:bg-white/8"
                }
              `}
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
                {formatDayNum(dateStr)}
              </span>

              <StatusDot status={status} isToday={isToday} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
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
  );
}
