"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"

interface RestTimerProps {
  seconds: number
  onComplete?: () => void
}

export function RestTimer({ seconds, onComplete }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [remaining, onComplete])

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`
  const progress = ((seconds - remaining) / seconds) * 100

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="rest-timer">
      <Timer className="h-4 w-4 shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span>Descanso</span>
          <span className="font-mono font-medium text-foreground">{formatted}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
