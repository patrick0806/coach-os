"use client"

import { Check, SkipForward } from "lucide-react"
import { useState } from "react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"

interface SetRowProps {
  setNumber: number
  plannedReps: number | null
  plannedWeight: string | null
  onComplete: (data: { reps: number; weight: string; status: "completed" | "skipped" }) => void
  disabled?: boolean
}

export function SetRow({ setNumber, plannedReps, plannedWeight, onComplete, disabled }: SetRowProps) {
  const [reps, setReps] = useState<string>(plannedReps?.toString() ?? "")
  const [weight, setWeight] = useState<string>(plannedWeight ?? "")

  function handleComplete(status: "completed" | "skipped") {
    onComplete({
      reps: parseInt(reps || "0", 10),
      weight: weight || "0",
      status,
    })
  }

  return (
    <div
      className="flex items-center gap-2 py-2"
      data-testid={`set-row-${setNumber}`}
    >
      {/* Set number badge */}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {setNumber}
      </span>

      {/* Reps input */}
      <div className="flex-1">
        <Input
          type="number"
          inputMode="numeric"
          placeholder={plannedReps?.toString() ?? "Reps"}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          disabled={disabled}
          className="h-9 text-center"
          data-testid={`reps-input-${setNumber}`}
        />
      </div>

      {/* Weight input */}
      <div className="flex-1">
        <Input
          type="number"
          inputMode="decimal"
          placeholder={plannedWeight ?? "Kg"}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          disabled={disabled}
          className="h-9 text-center"
          data-testid={`weight-input-${setNumber}`}
        />
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => handleComplete("skipped")}
          disabled={disabled}
          title="Pular série"
        >
          <SkipForward className="h-4 w-4" />
          <span className="sr-only">Pular</span>
        </Button>

        <Button
          type="button"
          size="icon"
          className="h-9 w-9 bg-success text-success-foreground hover:bg-success/90"
          onClick={() => handleComplete("completed")}
          disabled={disabled}
          title="Concluir série"
          data-testid={`complete-set-${setNumber}`}
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Concluir</span>
        </Button>
      </div>
    </div>
  )
}
