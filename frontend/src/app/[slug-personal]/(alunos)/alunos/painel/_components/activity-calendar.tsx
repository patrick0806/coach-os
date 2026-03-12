"use client";

import { useMemo } from "react";
import { TrainingSession } from "@/services/training-schedule.service";

interface ActivityCalendarProps {
  sessions: TrainingSession[];
  /** Number of weeks to display, defaults to 12 */
  weeks?: number;
}

type DayStatus = "completed" | "missed" | "rest" | "cancelled" | "future" | "empty";

interface CalendarDay {
  date: string;
  status: DayStatus;
}

function buildCalendarGrid(sessions: TrainingSession[], weeks: number): CalendarDay[][] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Go back to the most recent Sunday to align columns
  const start = new Date(today);
  start.setDate(start.getDate() - (start.getDay() + weeks * 7 - 1));

  const sessionMap = new Map<string, TrainingSession>();
  for (const s of sessions) {
    sessionMap.set(s.scheduledDate, s);
  }

  const columns: CalendarDay[][] = [];

  for (let col = 0; col < weeks; col++) {
    const column: CalendarDay[] = [];
    for (let row = 0; row < 7; row++) {
      const d = new Date(start);
      d.setDate(start.getDate() + col * 7 + row);
      const dateStr = d.toISOString().split("T")[0];

      if (d > today) {
        column.push({ date: dateStr, status: "future" });
        continue;
      }

      const session = sessionMap.get(dateStr);
      if (!session) {
        column.push({ date: dateStr, status: "empty" });
        continue;
      }

      let status: DayStatus;
      if (session.sessionType === "rest") {
        status = "rest";
      } else if (session.status === "completed") {
        status = "completed";
      } else if (session.status === "cancelled") {
        status = "cancelled";
      } else if (dateStr < todayStr) {
        // pending but in the past = missed
        status = "missed";
      } else {
        status = "future";
      }

      column.push({ date: dateStr, status });
    }
    columns.push(column);
  }

  return columns;
}

const STATUS_STYLES: Record<DayStatus, string> = {
  completed: "bg-primary opacity-90",
  missed: "bg-destructive/60",
  rest:
    "bg-muted-foreground/20 border border-muted-foreground/10",
  cancelled: "bg-muted-foreground/15",
  future: "bg-muted/40",
  empty: "bg-muted/20",
};

const DAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function ActivityCalendar({ sessions, weeks = 12 }: ActivityCalendarProps) {
  const grid = useMemo(() => buildCalendarGrid(sessions, weeks), [sessions, weeks]);

  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const missedCount = sessions.filter(
    (s) => s.status === "pending" && s.scheduledDate < new Date().toISOString().split("T")[0],
  ).length;

  return (
    <div className="premium-glass rounded-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Histórico de treinos
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-sm bg-primary opacity-90" />
            {completedCount} concluídos
          </span>
          {missedCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-sm bg-destructive/60" />
              {missedCount} perdidos
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 pr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex size-[18px] items-center justify-center text-[10px] text-muted-foreground/60">
              {i % 2 === 0 ? label : ""}
            </div>
          ))}
        </div>

        {/* Calendar columns */}
        <div className="flex flex-1 gap-1 overflow-hidden">
          {grid.map((column, colIdx) => (
            <div key={colIdx} className="flex flex-1 flex-col gap-1">
              {column.map((day) => (
                <div
                  key={day.date}
                  title={day.date}
                  className={`aspect-square w-full min-w-[10px] max-w-[22px] rounded-sm transition-opacity ${STATUS_STYLES[day.status]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
