"use client"

import { useEffect, useRef, useState } from "react"
import { Timer } from "lucide-react"

import { Button } from "@/shared/ui/button"

interface RestTimerProps {
  seconds: number
  onComplete?: () => void
  onSkip?: () => void
}

export function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onCompleteRef.current?.()
      return
    }

    const timer = setTimeout(() => {
      setRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [remaining])

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`
  const progress = ((seconds - remaining) / seconds) * 100

  return (
    <div className="flex flex-col items-center gap-4 py-6" data-testid="rest-timer">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Timer className="h-5 w-5" />
        <span className="text-sm font-medium">Descanso</span>
      </div>

      <span className="text-4xl font-mono font-bold text-foreground">{formatted}</span>

      <div className="h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {onSkip && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
          data-testid="skip-rest-button"
        >
          Pular Descanso
        </Button>
      )}
    </div>
  )
}
