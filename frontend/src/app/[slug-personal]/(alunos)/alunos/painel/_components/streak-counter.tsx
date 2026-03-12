interface StreakCounterProps {
  streak: number;
  totalWorkouts: number;
}

export function StreakCounter({ streak, totalWorkouts }: StreakCounterProps) {
  return (
    <div className="premium-glass flex items-center gap-4 rounded-3xl p-4">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15">
        <span
          className="text-3xl"
          style={{ filter: streak > 0 ? "drop-shadow(0 0 8px rgba(249,115,22,0.7))" : undefined }}
        >
          🔥
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Sequência atual
        </p>
        <p className="premium-heading text-2xl">
          {streak}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            {streak === 1 ? "dia" : "dias"} seguidos
          </span>
        </p>
      </div>

      <div className="ml-auto shrink-0 text-right">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Total
        </p>
        <p className="premium-heading text-lg">{totalWorkouts}</p>
        <p className="text-xs text-muted-foreground">treinos</p>
      </div>
    </div>
  );
}
