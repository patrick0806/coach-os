import type { LucideIcon } from "lucide-react";
import { Check, CheckCircle2, Clock, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface FeatureBlockProps {
  title: string;
  description: string;
  icon: LucideIcon;
  imageAlt: string;
  features: string[];
  mockType?: "training" | "schedule";
  reverse?: boolean;
}

/* ---- Training mock ---- */
function TrainingMock() {
  const exercises = [
    { name: "Supino Reto", sets: "4×10", weight: "80kg", done: true },
    { name: "Puxada Alta", sets: "3×12", weight: "60kg", done: true },
    { name: "Desenvolvimento", sets: "3×12", weight: "40kg", done: false },
    { name: "Rosca Direta", sets: "3×15", weight: "25kg", done: false },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Treino ativo
          </p>
          <p className="text-sm font-semibold">Treino A · Segunda</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">2 / 4 feitos</span>
        </div>
      </div>

      {/* Exercise rows */}
      <div className="divide-y divide-border/40">
        {exercises.map((ex) => (
          <div key={ex.name} className="flex items-center gap-3 px-4 py-3">
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                ex.done
                  ? "border-primary bg-primary"
                  : "border-border bg-background"
              )}
            >
              {ex.done && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span
              className={cn(
                "flex-1 truncate text-sm font-medium",
                ex.done && "text-muted-foreground line-through decoration-muted-foreground/50"
              )}
            >
              {ex.name}
            </span>
            <div className="text-right">
              <p className="text-xs font-semibold">{ex.sets}</p>
              <p className="text-[10px] text-muted-foreground">{ex.weight}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress footer */}
      <div className="border-t border-border/60 px-4 py-3">
        <div className="mb-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>Progresso do treino</span>
          <span>50%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary transition-all" />
        </div>
      </div>
    </div>
  );
}

/* ---- Schedule mock ---- */
function ScheduleMock() {
  const sessions = [
    {
      day: "Seg",
      time: "08:00",
      name: "João S.",
      color: "bg-primary/10 border-primary/30 text-primary",
    },
    {
      day: "Ter",
      time: "09:30",
      name: "Maria P.",
      color: "bg-info/10 border-info/30 text-info",
    },
    {
      day: "Qua",
      time: "07:00",
      name: "Carlos M.",
      color: "bg-success/10 border-success/30 text-success",
    },
    {
      day: "Sex",
      time: "10:00",
      name: "Ana L.",
      color: "bg-warning/10 border-warning/30 text-warning",
    },
  ];

  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold">Agenda · Semana atual</p>
        <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1">
          <CheckCircle2 className="h-3 w-3 text-success" />
          <span className="text-xs font-medium text-success">4 sessões</span>
        </div>
      </div>

      {/* Day columns header */}
      <div className="grid grid-cols-5 border-b border-border/40 bg-muted/30">
        {days.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Session cells */}
      <div className="grid grid-cols-5 gap-1.5 p-3">
        {days.map((d) => {
          const session = sessions.find((s) => s.day === d);
          return session ? (
            <div
              key={d}
              className={cn(
                "flex flex-col items-center rounded-lg border px-1 py-2.5 text-center",
                session.color
              )}
            >
              <Clock className="mb-1 h-3 w-3 opacity-70" />
              <p className="text-[10px] font-semibold leading-none">
                {session.time}
              </p>
              <p className="mt-1 text-[9px] leading-tight opacity-80">
                {session.name}
              </p>
            </div>
          ) : (
            <div
              key={d}
              className="flex items-center justify-center rounded-lg border border-dashed border-border/40 py-4"
            >
              <span className="text-[9px] text-muted-foreground/40">livre</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2.5">
        <span className="flex h-2 w-2 rounded-full bg-success" />
        <p className="text-xs text-muted-foreground">Sem conflitos de horário</p>
      </div>
    </div>
  );
}

export function FeatureBlock({
  title,
  description,
  icon: Icon,
  features,
  mockType,
  reverse,
}: FeatureBlockProps) {
  return (
    <div
      data-slot="feature-block"
      className={cn(
        "mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2",
        reverse && "lg:[&>:first-child]:order-2"
      )}
    >
      <div className="space-y-6">
        <div className="inline-flex rounded-xl bg-primary/10 p-3">
          <Icon className="size-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground">{description}</p>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ChevronRight className="h-3 w-3 text-primary" />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center px-4">
        {mockType === "training" ? (
          <div className="w-full max-w-sm">
            <TrainingMock />
          </div>
        ) : mockType === "schedule" ? (
          <div className="w-full max-w-sm">
            <ScheduleMock />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">Preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
