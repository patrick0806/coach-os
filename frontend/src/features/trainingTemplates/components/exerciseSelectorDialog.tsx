"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, Dumbbell, ArrowLeft } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Badge } from "@/shared/ui/badge"
import { Skeleton } from "@/shared/ui/skeleton"
import { useExercises } from "@/features/exercises/hooks/useExercises"
import { useAddExerciseTemplate } from "@/features/trainingTemplates/hooks/useAddExerciseTemplate"
import type { ExerciseItem } from "@/features/exercises/types/exercises.types"

const DEBOUNCE_MS = 400

const exerciseParamsSchema = z.object({
  sets: z
    .string()
    .min(1, "Séries é obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Mínimo 1 série"),
  repetitions: z.string().optional(),
  restSeconds: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
})

type ExerciseParamsValues = z.infer<typeof exerciseParamsSchema>

interface ExerciseSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workoutId: string
  templateId: string
}

export function ExerciseSelectorDialog({
  open,
  onOpenChange,
  workoutId,
  templateId,
}: ExerciseSelectorDialogProps) {
  const [step, setStep] = useState<"select" | "params">("select")
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: exercisesData, isLoading } = useExercises({
    search: debouncedSearch || undefined,
    size: 20,
  })

  const addExercise = useAddExerciseTemplate({
    templateId,
    onOpenChange: (open) => {
      if (!open) {
        handleClose()
      }
    },
  })

  const form = useForm<ExerciseParamsValues>({
    resolver: zodResolver(exerciseParamsSchema),
    defaultValues: {
      sets: "",
      repetitions: "",
      restSeconds: "",
      duration: "",
      notes: "",
    },
  })

  function handleClose() {
    onOpenChange(false)
    setStep("select")
    setSelectedExercise(null)
    setSearchInput("")
    setDebouncedSearch("")
    form.reset()
  }

  function handleSelectExercise(exercise: ExerciseItem) {
    setSelectedExercise(exercise)
    setStep("params")
  }

  function handleBack() {
    setStep("select")
    setSelectedExercise(null)
    form.reset()
  }

  function onSubmit(values: ExerciseParamsValues) {
    if (!selectedExercise) return

    const sets = Number(values.sets)
    const repetitions = values.repetitions ? Number(values.repetitions) : undefined
    const restSeconds = values.restSeconds ? Number(values.restSeconds) : undefined
    const duration = values.duration || undefined
    const notes = values.notes || undefined

    addExercise.mutate({
      workoutId,
      data: {
        exerciseId: selectedExercise.id,
        sets,
        repetitions,
        restSeconds,
        duration,
        notes,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "Selecionar exercício" : "Configurar exercício"}
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar exercício..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
                data-testid="exercise-selector-search"
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 rounded-md border p-1">
              {isLoading && (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              )}

              {!isLoading && !exercisesData?.content.length && (
                <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
                  <Dumbbell className="size-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Nenhum exercício encontrado</p>
                </div>
              )}

              {!isLoading &&
                exercisesData?.content.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelectExercise(exercise)}
                    className="flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    data-testid="exercise-option"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {exercise.muscleGroup}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        exercise.tenantId === null
                          ? "text-xs shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "text-xs shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                      }
                    >
                      {exercise.tenantId === null ? "Plataforma" : "Meu"}
                    </Badge>
                  </button>
                ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "params" && selectedExercise && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <Dumbbell className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{selectedExercise.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedExercise.muscleGroup}
                </p>
              </div>
            </div>

            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="exercise-sets">Séries *</FieldLabel>
                  <Input
                    id="exercise-sets"
                    type="number"
                    min="1"
                    placeholder="Ex: 4"
                    data-testid="exercise-sets-input"
                    {...form.register("sets")}
                  />
                  <FieldError errors={[form.formState.errors.sets]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="exercise-repetitions">Repetições</FieldLabel>
                  <Input
                    id="exercise-repetitions"
                    type="number"
                    min="1"
                    placeholder="Ex: 12"
                    data-testid="exercise-reps-input"
                    {...form.register("repetitions")}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="exercise-rest">Descanso (seg)</FieldLabel>
                  <Input
                    id="exercise-rest"
                    type="number"
                    min="0"
                    placeholder="Ex: 60"
                    data-testid="exercise-rest-input"
                    {...form.register("restSeconds")}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="exercise-duration">Duração</FieldLabel>
                  <Input
                    id="exercise-duration"
                    placeholder="Ex: 00:01:00"
                    data-testid="exercise-duration-input"
                    {...form.register("duration")}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="exercise-notes">Observações</FieldLabel>
                <Input
                  id="exercise-notes"
                  placeholder="Ex: Manter cotovelo fixo..."
                  data-testid="exercise-notes-input"
                  {...form.register("notes")}
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={addExercise.isPending}
              >
                <ArrowLeft className="mr-2 size-4" />
                Voltar
              </Button>
              <Button type="submit" disabled={addExercise.isPending} data-testid="add-exercise-submit">
                {addExercise.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
