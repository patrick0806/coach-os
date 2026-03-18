"use client"

import Link from "next/link"
import { ChevronRight, Dumbbell } from "lucide-react"

import { useStudentActivePrograms } from "@/features/studentPortal/hooks/useStudentActivePrograms"
import { useStudentProgramDetail } from "@/features/studentPortal/hooks/useStudentProgramDetail"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
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
    <Card data-testid="program-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{program.name}</CardTitle>
          <Badge variant="secondary">Ativo</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-12 animate-pulse rounded bg-muted" />
        ) : workoutDays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum dia de treino configurado.</p>
        ) : (
          <div className="space-y-2" data-testid="workout-days-list">
            {workoutDays.map((day) => (
              <Link
                key={day.id}
                href={`/aluno/treinos/${program.id}/${day.id}/executar`}
                className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
                data-testid="workout-day-link"
              >
                <div>
                  <p className="text-sm font-medium">{day.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.studentExercises.length} exercício
                    {day.studentExercises.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
