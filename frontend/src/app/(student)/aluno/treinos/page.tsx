"use client"

import Link from "next/link"
import { ChevronRight, Dumbbell } from "lucide-react"

import { useStudentActivePrograms } from "@/features/studentPortal/hooks/useStudentActivePrograms"
import { useStudentProgramDetail } from "@/features/studentPortal/hooks/useStudentProgramDetail"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import type { StudentProgramItem } from "@/features/studentPrograms/types/studentPrograms.types"

export default function StudentTreinosPage() {
  const { data, isLoading } = useStudentActivePrograms()

  if (isLoading) {
    return <LoadingState variant="list" />
  }

  const programs = data?.content ?? []

  if (programs.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Nenhum programa ativo"
        description="Seu treinador ainda não atribuiu um programa de treino para você."
        data-testid="empty-state"
      />
    )
  }

  return (
    <div className="space-y-4" data-testid="programs-list">
      <h2 className="text-lg font-semibold">Meus Treinos</h2>

      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  )
}

interface ProgramCardProps {
  program: StudentProgramItem
}

function ProgramCard({ program }: ProgramCardProps) {
  const { data, isLoading } = useStudentProgramDetail(program.id)

  const workoutDays = data?.workoutDays ?? []

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl"
      data-testid="program-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-primary/5 px-4 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Treino ativo
          </p>
          <p className="text-sm font-semibold">{program.name}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">
            {workoutDays.length} dia{workoutDays.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Workout days */}
      {isLoading ? (
        <div className="px-4 py-4">
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      ) : workoutDays.length === 0 ? (
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">Nenhum dia de treino configurado.</p>
        </div>
      ) : (
        <div data-testid="workout-days-list">
          {workoutDays.map((day, index) => (
            <Link
              key={day.id}
              href={`/aluno/treinos/${program.id}/${day.id}/executar`}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 ${
                index < workoutDays.length - 1 ? "border-b border-border/40" : ""
              }`}
              data-testid="workout-day-link"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-background" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{day.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {day.studentExercises.length} exercício
                  {day.studentExercises.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
