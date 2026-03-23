"use client"

import { Dumbbell, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import Image from "next/image"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { type ExerciseItem } from "@/features/exercises/types/exercises.types"
import { useEnumMuscleGroups } from "@/features/shared/hooks/useEnumMuscleGroups"

interface ExerciseCardProps {
  exercise: ExerciseItem
  onView: (exercise: ExerciseItem) => void
  onEdit: (exercise: ExerciseItem) => void
  onDelete: (exercise: ExerciseItem) => void
}

export function ExerciseCard({ exercise, onView, onEdit, onDelete }: ExerciseCardProps) {
  const { data: muscleGroups } = useEnumMuscleGroups()
  const muscleGroupLabel = muscleGroups?.find((g) => g.value === exercise.muscleGroup)?.label ?? exercise.muscleGroup
  const isGlobal = exercise.tenantId === null

  return (
    <Card className="group overflow-hidden">
      <div className="relative h-40 bg-muted flex items-center justify-center">
        {exercise.mediaUrl ? (
          <Image
            src={exercise.mediaUrl}
            alt={exercise.name}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <Dumbbell className="size-10 text-muted-foreground/40" />
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant={isGlobal ? "secondary" : "default"}
            className={isGlobal ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"}
          >
            {isGlobal ? "Plataforma" : "Meu"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-sm">{exercise.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {muscleGroupLabel}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity [@media(hover:none)]:opacity-100"
                data-testid="exercise-actions"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(exercise)}>
                <Eye className="mr-2 size-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => !isGlobal && onEdit(exercise)}
                disabled={isGlobal}
                data-testid="edit-exercise"
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => !isGlobal && onDelete(exercise)}
                disabled={isGlobal}
                className="text-destructive focus:text-destructive"
                data-testid="delete-exercise"
              >
                <Trash2 className="mr-2 size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
