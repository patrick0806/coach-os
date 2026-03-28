"use client"

import { useState } from "react"
import { use } from "react"
import Link from "next/link"
import { ChevronLeft, ClipboardList, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { LoadingState } from "@/shared/components/loadingState"
import { EmptyState } from "@/shared/components/emptyState"
import { StudentProgramStatusBadge } from "@/features/studentPrograms/components/studentProgramStatusBadge"
import { UpdateProgramStatusDialog } from "@/features/studentPrograms/components/updateProgramStatusDialog"
import { WorkoutDayCard } from "@/features/studentPrograms/components/workoutDayCard"
import { AddWorkoutDayDialog } from "@/features/studentPrograms/components/addWorkoutDayDialog"
import { useStudentProgram } from "@/features/studentPrograms/hooks/useStudentProgram"
import { useDeleteWorkoutDay } from "@/features/studentPrograms/hooks/useDeleteWorkoutDay"
import { useReorderWorkoutDays } from "@/features/studentPrograms/hooks/useReorderWorkoutDays"
import type { WorkoutDayItem } from "@/features/studentPrograms/types/studentPrograms.types"

interface ProgramDetailPageProps {
  params: Promise<{ id: string; programId: string }>
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id: studentId, programId } = use(params)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [addDayDialogOpen, setAddDayDialogOpen] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  const { data: program, isLoading } = useStudentProgram(programId)
  const deleteWorkoutDay = useDeleteWorkoutDay({ programId })
  const reorderWorkoutDays = useReorderWorkoutDays({ programId })

  function toggleDay(dayId: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayId)) {
        next.delete(dayId)
      } else {
        next.add(dayId)
      }
      return next
    })
  }

  function handleMoveDayUp(day: WorkoutDayItem) {
    if (!program) return
    const sorted = [...program.workoutDays].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((d) => d.id === day.id)
    if (index <= 0) return
    const newOrder = [...sorted]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reorderWorkoutDays.mutate({ items: newOrder.map((d, i) => ({ id: d.id, order: i })) })
  }

  function handleMoveDayDown(day: WorkoutDayItem) {
    if (!program) return
    const sorted = [...program.workoutDays].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((d) => d.id === day.id)
    if (index >= sorted.length - 1) return
    const newOrder = [...sorted]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    reorderWorkoutDays.mutate({ items: newOrder.map((d, i) => ({ id: d.id, order: i })) })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link
          href={`/students/${studentId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Voltar para o aluno
        </Link>
        <LoadingState variant="page" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="space-y-6">
        <Link
          href={`/students/${studentId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Voltar para o aluno
        </Link>
        <p className="text-sm text-muted-foreground">Programa não encontrado.</p>
      </div>
    )
  }

  const sortedDays = [...program.workoutDays].sort((a, b) => a.order - b.order)
  const isMutatingDays = deleteWorkoutDay.isPending || reorderWorkoutDays.isPending

  return (
    <div className="space-y-6">
      <Link
        href={`/students/${studentId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Voltar para o aluno
      </Link>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
          <StudentProgramStatusBadge status={program.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddDayDialogOpen(true)}
            data-testid="add-workout-day-button"
          >
            <Plus className="size-4 mr-1" />
            Adicionar dia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
            data-testid="change-status-button"
          >
            Alterar status
          </Button>
        </div>
      </div>

      {sortedDays.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum dia de treino"
          description="Este programa não possui dias de treino configurados."
          className="py-12"
        />
      ) : (
        <div className="space-y-3">
          {sortedDays.map((day, index) => (
            <WorkoutDayCard
              key={day.id}
              workoutDay={day}
              programId={programId}
              isExpanded={expandedDays.has(day.id)}
              isFirst={index === 0}
              isLast={index === sortedDays.length - 1}
              isMutatingDays={isMutatingDays}
              onToggle={() => toggleDay(day.id)}
              onDelete={(id) => deleteWorkoutDay.mutate(id)}
              onMoveUp={handleMoveDayUp}
              onMoveDown={handleMoveDayDown}
            />
          ))}
        </div>
      )}

      <UpdateProgramStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        program={program}
        studentId={studentId}
      />

      <AddWorkoutDayDialog
        open={addDayDialogOpen}
        onOpenChange={setAddDayDialogOpen}
        programId={programId}
      />
    </div>
  )
}
