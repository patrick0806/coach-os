"use client"

import { startTransition, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ClipboardList, Plus } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { LoadingState } from "@/shared/components/loadingState"
import { PageHeader } from "@/shared/components/pageHeader"
import { EmptyState } from "@/shared/components/emptyState"
import { WorkoutTemplateCard } from "@/features/trainingTemplates/components/workoutTemplateCard"
import { WorkoutFormDialog } from "@/features/trainingTemplates/components/workoutFormDialog"
import { DeleteWorkoutDialog } from "@/features/trainingTemplates/components/deleteWorkoutDialog"
import { useProgramTemplate } from "@/features/trainingTemplates/hooks/useProgramTemplate"
import { useReorderWorkoutTemplates } from "@/features/trainingTemplates/hooks/useReorderWorkoutTemplates"
import type { WorkoutTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

export default function ProgramTemplateBuilderPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const templateId = params.id

  const { data: template, isLoading } = useProgramTemplate(templateId)

  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false)
  const [editWorkout, setEditWorkout] = useState<WorkoutTemplateItem | null>(null)
  const [deleteWorkout, setDeleteWorkout] = useState<WorkoutTemplateItem | null>(null)
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null)

  const reorderWorkouts = useReorderWorkoutTemplates({ templateId })

  // Auto-expand first workout on load
  useEffect(() => {
    if (template?.workoutTemplates.length && expandedWorkoutId === null) {
      const sorted = [...template.workoutTemplates].sort((a, b) => a.order - b.order)
      startTransition(() => setExpandedWorkoutId(sorted[0]?.id ?? null))
    }
  }, [template, expandedWorkoutId])

  function handleToggleWorkout(workoutId: string) {
    setExpandedWorkoutId((prev) => (prev === workoutId ? null : workoutId))
  }

  function handleMoveWorkoutUp(workout: WorkoutTemplateItem) {
    if (!template) return
    const sorted = [...template.workoutTemplates].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((w) => w.id === workout.id)
    if (index <= 0) return
    const newOrder = [...sorted]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reorderWorkouts.mutate({ ids: newOrder.map((w) => w.id) })
  }

  function handleMoveWorkoutDown(workout: WorkoutTemplateItem) {
    if (!template) return
    const sorted = [...template.workoutTemplates].sort((a, b) => a.order - b.order)
    const index = sorted.findIndex((w) => w.id === workout.id)
    if (index >= sorted.length - 1) return
    const newOrder = [...sorted]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    reorderWorkouts.mutate({ ids: newOrder.map((w) => w.id) })
  }

  if (isLoading) {
    return <LoadingState variant="page" />
  }

  if (!template) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Programa não encontrado"
        description="O programa que você está procurando não existe ou foi removido."
        action={
          <Button variant="outline" onClick={() => router.push("/training-templates")}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Button>
        }
      />
    )
  }

  const sortedWorkouts = [...template.workoutTemplates].sort((a, b) => a.order - b.order)
  const isArchived = template.status === "archived"

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        description={template.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/training-templates")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>
            <Badge
              variant="secondary"
              className={
                isArchived
                  ? "bg-muted text-muted-foreground"
                  : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              }
            >
              {isArchived ? "Arquivado" : "Ativo"}
            </Badge>
          </div>
        }
      />

      <div className="space-y-3">
        {sortedWorkouts.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum treino"
            description="Adicione treinos a este programa."
            action={
              <Button onClick={() => setAddWorkoutOpen(true)} data-testid="add-first-workout-button">
                <Plus className="mr-2 size-4" />
                Adicionar treino
              </Button>
            }
          />
        ) : (
          <>
            {sortedWorkouts.map((workout, index) => (
              <WorkoutTemplateCard
                key={workout.id}
                workout={workout}
                templateId={templateId}
                isExpanded={expandedWorkoutId === workout.id}
                isFirst={index === 0}
                isLast={index === sortedWorkouts.length - 1}
                isMutatingOrder={reorderWorkouts.isPending}
                onToggle={() => handleToggleWorkout(workout.id)}
                onEdit={(w) => setEditWorkout(w)}
                onDelete={(w) => setDeleteWorkout(w)}
                onMoveUp={handleMoveWorkoutUp}
                onMoveDown={handleMoveWorkoutDown}
              />
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAddWorkoutOpen(true)}
              data-testid="add-workout-button"
            >
              <Plus className="mr-2 size-4" />
              Adicionar treino
            </Button>
          </>
        )}
      </div>

      <WorkoutFormDialog
        open={addWorkoutOpen}
        onOpenChange={(open) => {
          setAddWorkoutOpen(open)
          // Will auto-expand the new workout via the useEffect above when data refreshes
        }}
        templateId={templateId}
      />

      {editWorkout && (
        <WorkoutFormDialog
          open={!!editWorkout}
          onOpenChange={(open) => !open && setEditWorkout(null)}
          templateId={templateId}
          workout={editWorkout}
        />
      )}

      <DeleteWorkoutDialog
        workout={deleteWorkout}
        open={!!deleteWorkout}
        onOpenChange={(open) => !open && setDeleteWorkout(null)}
        templateId={templateId}
      />
    </div>
  )
}
