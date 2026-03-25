"use client"

import { useState, useMemo } from "react"
import { Plus, Pencil, Trash2, Clock } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/components/emptyState"
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
import { WorkingHoursFormDialog } from "./workingHoursFormDialog"
import { useWorkingHours, useDeleteWorkingHours } from "@/features/scheduling/hooks/useWorkingHours"
import {
  DAY_OF_WEEK_LABELS,
  type WorkingHoursItem,
} from "@/features/scheduling/types/scheduling.types"

export function WorkingHoursSection() {
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<WorkingHoursItem | undefined>()
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState<number | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: workingHours = [], isLoading } = useWorkingHours()
  const deleteWH = useDeleteWorkingHours()

  const displayOrder = [1, 2, 3, 4, 5, 6, 0]
  const grouped = useMemo(() => {
    const groups: { dayOfWeek: number; items: WorkingHoursItem[] }[] = []
    for (const day of displayOrder) {
      const dayItems = workingHours
        .filter((wh) => wh.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
      if (dayItems.length > 0) {
        groups.push({ dayOfWeek: day, items: dayItems })
      }
    }
    return groups
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingHours])

  function handleEdit(item: WorkingHoursItem) {
    setEditItem(item)
    setDefaultDayOfWeek(undefined)
    setFormDialogOpen(true)
  }

  function handleAddForDay(day: number) {
    setEditItem(undefined)
    setDefaultDayOfWeek(day)
    setFormDialogOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormDialogOpen(open)
    if (!open) {
      setEditItem(undefined)
      setDefaultDayOfWeek(undefined)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Defina os horarios em que voce esta disponivel por dia da semana.
          </p>
          <Button size="sm" onClick={() => setFormDialogOpen(true)} data-testid="add-rule-btn">
            <Plus className="size-4 mr-1.5" />
            Adicionar horario
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : workingHours.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nenhum horario definido"
            description="Adicione seus horarios de atendimento para que seus alunos possam solicitar agendamentos."
          />
        ) : (
          <div className="space-y-3">
            {grouped.map(({ dayOfWeek, items }) => (
              <div
                key={dayOfWeek}
                className="rounded-lg border border-border p-3"
                data-testid="availability-day-group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{DAY_OF_WEEK_LABELS[dayOfWeek]}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleAddForDay(dayOfWeek)}
                    data-testid="add-rule-day-btn"
                  >
                    <Plus className="size-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm"
                      data-testid="availability-rule-item"
                    >
                      <span className="font-medium">
                        {item.startTime} – {item.endTime}
                      </span>
                      <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-muted"
                          onClick={() => handleEdit(item)}
                          data-testid="edit-rule-btn"
                        >
                          <Pencil className="size-3 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-destructive/10"
                          onClick={() => setDeleteId(item.id)}
                          data-testid="delete-rule-btn"
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <WorkingHoursFormDialog
        open={formDialogOpen}
        onOpenChange={handleFormClose}
        item={editItem}
        defaultDayOfWeek={defaultDayOfWeek}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Este horario de disponibilidade sera removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteWH.mutate(deleteId)
                setDeleteId(null)
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
