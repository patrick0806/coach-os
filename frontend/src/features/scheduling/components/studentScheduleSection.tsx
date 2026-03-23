"use client"

import { useState } from "react"
import { Clock, MapPin, Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { LoadingState } from "@/shared/components/loadingState"
import {
  useTrainingSchedules,
  useDeleteTrainingSchedule,
} from "@/features/scheduling/hooks/useTrainingSchedules"
import { TrainingScheduleFormDialog } from "@/features/scheduling/components/trainingScheduleFormDialog"
import type { TrainingScheduleItem } from "@/features/scheduling/types/scheduling.types"
import { DAY_OF_WEEK_LABELS } from "@/features/scheduling/types/scheduling.types"
import { toast } from "sonner"

interface StudentScheduleSectionProps {
  studentId: string
}

// Order: Monday(1) through Saturday(6), then Sunday(0)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function StudentScheduleSection({ studentId }: StudentScheduleSectionProps) {
  const { data: schedules, isLoading } = useTrainingSchedules(studentId)
  const deleteSchedule = useDeleteTrainingSchedule(studentId)

  const [formOpen, setFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<TrainingScheduleItem | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<TrainingScheduleItem | null>(null)

  function handleAdd() {
    setEditingSchedule(undefined)
    setFormOpen(true)
  }

  function handleEdit(schedule: TrainingScheduleItem) {
    setEditingSchedule(schedule)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteSchedule.mutateAsync(deleteTarget.id)
      toast.success("Horário removido com sucesso!")
    } catch {
      toast.error("Erro ao remover horário")
    }
    setDeleteTarget(null)
  }

  if (isLoading) {
    return <LoadingState variant="card" />
  }

  const schedulesByDay = new Map<number, TrainingScheduleItem[]>()
  for (const s of schedules ?? []) {
    const list = schedulesByDay.get(s.dayOfWeek) ?? []
    list.push(s)
    schedulesByDay.set(s.dayOfWeek, list)
  }

  const hasSchedules = (schedules ?? []).length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Horários de Treino</h3>
        <Button size="sm" variant="outline" onClick={handleAdd} data-testid="add-schedule-btn">
          <Plus className="mr-1.5 size-3.5" />
          Adicionar
        </Button>
      </div>

      {!hasSchedules ? (
        <div className="rounded-lg border border-dashed p-8 text-center" data-testid="empty-schedules">
          <p className="text-sm text-muted-foreground">
            Nenhum horário de treino definido.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Adicione os dias e horários em que o aluno treina.
          </p>
        </div>
      ) : (
        <div className="grid gap-2" data-testid="schedules-grid">
          {DAY_ORDER.map((dayOfWeek) => {
            const daySchedules = schedulesByDay.get(dayOfWeek)
            if (!daySchedules || daySchedules.length === 0) return null

            return daySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  schedule.isActive === false ? "opacity-50" : ""
                }`}
                data-testid="schedule-entry"
              >
                <div className="flex items-center gap-3">
                  <span className="w-16 text-xs font-medium text-muted-foreground">
                    {DAY_OF_WEEK_LABELS[dayOfWeek]}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="size-3.5 text-muted-foreground" />
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                  {schedule.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {schedule.location}
                    </div>
                  )}
                  {schedule.isActive === false && (
                    <span className="text-xs text-muted-foreground">(inativo)</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => handleEdit(schedule)}
                    data-testid="edit-schedule-btn"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(schedule)}
                    data-testid="delete-schedule-btn"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          })}
        </div>
      )}

      <TrainingScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        studentId={studentId}
        schedule={editingSchedule}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover horário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este horário de treino? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
