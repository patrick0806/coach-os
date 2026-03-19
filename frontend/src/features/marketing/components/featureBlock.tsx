import type { LucideIcon } from "lucide-react";
import { Check, CheckCircle2, Clock, ChevronRight, Dumbbell, Timer } from "lucide-react";

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
          <span className="text-xs font-medium text-primary">1 / 3 feitos</span>
        </div>
      </div>

      {/* Exercise 1 — completed */}
      <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 opacity-60">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium line-through text-muted-foreground">Supino Reto</p>
          <p className="text-[10px] text-muted-foreground">4 séries × 10 reps</p>
        </div>
        <span className="text-[10px] rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">Concluído</span>
      </div>

      {/* Exercise 2 — in progress, expanded */}
      <div className="border-b border-border/40">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Dumbbell className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">Puxada Alta</p>
            <p className="text-[10px] text-muted-foreground">3 séries × 12 reps — 60kg</p>
          </div>
        </div>
        {/* Set rows */}
        <div className="px-4 pb-3 space-y-1.5">
          {/* Set 1 — done */}
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5">
            <Check className="h-3 w-3 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground flex-1">Série 1</span>
            <span className="text-xs font-semibold">12 reps · 60kg</span>
          </div>
          {/* Set 2 — active */}
          <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-xs font-medium text-primary flex-1">Série 2</span>
            <span className="text-[10px] text-muted-foreground">ativa</span>
          </div>
          {/* Rest timer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <Timer className="h-3 w-3 shrink-0" />
            <span className="flex-1">Descanso</span>
            <span className="font-mono font-medium text-foreground">0:45</span>
          </div>
        </div>
      </div>

      {/* Exercise 3 — pending */}
      <div className="flex items-center gap-3 px-4 py-3 opacity-50">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background" />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">Desenvolvimento</p>
          <p className="text-[10px] text-muted-foreground">3 séries × 12 reps</p>
        </div>
      </div>

      {/* Progress footer */}
      <div className="border-t border-border/60 px-4 py-3">
        <div className="mb-1.5 flex justify-between text-[10px] text-muted-foreground">
          <span>Progresso do treino</span>
          <span>33%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: "33%" }} />
        </div>
      </div>
    </div>
  );
}

/* ---- Schedule mock ---- */
function ScheduleMock() {
  const trainingDays: Record<string, string> = {
    Seg: "08:00",
    Qua: "08:00",
    Sex: "08:00",
  };

  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Sua agenda
          </p>
          <p className="text-sm font-semibold">Semana atual</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">3 treinos</span>
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

      {/* Day cells */}
      <div className="grid grid-cols-5 gap-1.5 p-3">
        {days.map((d) => {
          const time = trainingDays[d];
          return time ? (
            <div
              key={d}
              className="flex flex-col items-center rounded-lg border border-primary/30 bg-primary/10 px-1 py-2.5 text-center text-primary"
            >
              <Clock className="mb-1 h-3 w-3 opacity-70" />
              <p className="text-[10px] font-semibold leading-none">{time}</p>
              <p className="mt-1 text-[9px] leading-tight opacity-80">Treino</p>
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

      {/* Next appointment */}
      <div className="border-t border-border/60 px-4 py-2.5 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Próxima aula</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Ter 09:30 · Online</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5">
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-[10px] font-medium text-success">Agendada</span>
          </div>
        </div>
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
