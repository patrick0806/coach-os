"use client"

import type { ReactNode } from "react"

interface AgendaCardProps {
  trainingCount: number
  children: ReactNode
}

export function AgendaCard({ trainingCount, children }: AgendaCardProps) {
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
        {trainingCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-primary">
              {trainingCount} treino{trainingCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
