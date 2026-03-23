"use client"

import { Pencil, ExternalLink } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { type ExerciseItem } from "@/features/exercises/types/exercises.types"
import { useEnumMuscleGroups } from "@/features/shared/hooks/useEnumMuscleGroups"

interface ExerciseDetailDialogProps {
  exercise: ExerciseItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (exercise: ExerciseItem) => void
}

export function ExerciseDetailDialog({
  exercise,
  open,
  onOpenChange,
  onEdit,
}: ExerciseDetailDialogProps) {
  const { data: muscleGroups } = useEnumMuscleGroups()

  if (!exercise) return null

  const isGlobal = exercise.tenantId === null
  const muscleGroupLabel = muscleGroups?.find((g) => g.value === exercise.muscleGroup)?.label ?? exercise.muscleGroup

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate">{exercise.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {muscleGroupLabel}
              </p>
            </div>
            <Badge
              className={
                isGlobal
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 shrink-0"
              }
            >
              {isGlobal ? "Plataforma" : "Meu"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {exercise.mediaUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={exercise.mediaUrl}
                alt={exercise.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          {exercise.description && (
            <div>
              <p className="text-sm font-medium mb-1">Descrição</p>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            </div>
          )}

          {exercise.instructions && (
            <div>
              <p className="text-sm font-medium mb-1">Instruções</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {exercise.instructions}
              </p>
            </div>
          )}

          {exercise.youtubeUrl && (
            <div>
              <a
                href={exercise.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                data-testid="youtube-link"
              >
                <ExternalLink className="size-3.5" />
                Ver no YouTube
              </a>
            </div>
          )}
        </div>

        {!isGlobal && (
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEdit(exercise)
              }}
            >
              <Pencil className="mr-2 size-4" />
              Editar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
