"use client";

interface ProgressRingProps {
  value: number;
  label: string;
  helper: string;
}

export function ProgressRing({ value, label, helper }: ProgressRingProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="premium-surface flex min-w-0 flex-1 items-center gap-3 rounded-3xl p-4">
      <div className="relative grid size-20 place-items-center">
        <svg className="size-20 -rotate-90" viewBox="0 0 88 88" aria-hidden="true">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
            strokeWidth="8"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="url(#premium-progress-gradient)"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
          <defs>
            <linearGradient id="premium-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="color-mix(in oklab, var(--primary) 88%, white 12%)" />
              <stop offset="100%" stopColor="color-mix(in oklab, var(--primary) 52%, transparent)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="premium-heading text-lg">{normalizedValue}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="premium-heading text-sm">{label}</p>
        <p className="premium-subheading mt-1">{helper}</p>
      </div>
    </div>
  );
}
