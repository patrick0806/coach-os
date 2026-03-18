"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/shared/ui/button"

export function WorkoutCompletionScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-16 text-center"
      data-testid="completion-screen"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Treino concluído!</h2>
        <p className="text-muted-foreground">
          Ótimo trabalho! Seu progresso foi registrado.
        </p>
      </div>

      <Button asChild className="min-h-12 px-8">
        <Link href="/aluno/treinos">Voltar aos treinos</Link>
      </Button>
    </div>
  )
}
