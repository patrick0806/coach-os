"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { useUpdateStudentExercise } from "@/features/studentPrograms/hooks/useUpdateStudentExercise"
import type { StudentExerciseItem } from "@/features/studentPrograms/types/studentPrograms.types"

const schema = z.object({
  sets: z.number().int().positive("Deve ser positivo"),
  repetitions: z.number().int().positive().nullable().optional(),
  plannedWeight: z.string().nullable().optional(),
  restSeconds: z.number().int().nonnegative().nullable().optional(),
  duration: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface UpdateStudentExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: StudentExerciseItem | null
  programId: string
}

export function UpdateStudentExerciseDialog({
  open,
  onOpenChange,
  exercise,
  programId,
}: UpdateStudentExerciseDialogProps) {
  const updateExercise = useUpdateStudentExercise({ programId, onOpenChange })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open && exercise) {
      reset({
        sets: exercise.sets,
        repetitions: exercise.repetitions ?? undefined,
        plannedWeight: exercise.plannedWeight ?? "",
        restSeconds: exercise.restSeconds ?? undefined,
        duration: exercise.duration ?? "",
        notes: exercise.notes ?? "",
      })
    }
  }, [open, exercise, reset])

  function onSubmit(data: FormData) {
    if (!exercise) return
    updateExercise.mutate({
      id: exercise.id,
      data: {
        sets: data.sets,
        repetitions: data.repetitions ?? null,
        plannedWeight: data.plannedWeight || null,
        restSeconds: data.restSeconds ?? null,
        duration: data.duration || null,
        notes: data.notes || null,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Editar exercício{exercise ? ` — ${exercise.exercise.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Séries *</Label>
              <Input
                id="sets"
                type="number"
                min={1}
                data-testid="sets-input"
                {...register("sets", { valueAsNumber: true })}
              />
              {errors.sets && (
                <p className="text-xs text-destructive">{errors.sets.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repetitions">Repetições</Label>
              <Input
                id="repetitions"
                type="number"
                min={1}
                placeholder="—"
                data-testid="repetitions-input"
                {...register("repetitions", { setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedWeight">Carga sugerida (kg)</Label>
              <Input
                id="plannedWeight"
                placeholder="Ex: 80.00"
                data-testid="planned-weight-input"
                {...register("plannedWeight")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restSeconds">Descanso (seg)</Label>
              <Input
                id="restSeconds"
                type="number"
                min={0}
                placeholder="—"
                data-testid="rest-seconds-input"
                {...register("restSeconds", { setValueAs: (v) => (v === "" || v === null || v === undefined ? null : Number(v)) })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                placeholder="Ex: 30s, 2min"
                data-testid="duration-input"
                {...register("duration")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Instruções específicas para este aluno..."
              rows={3}
              data-testid="notes-input"
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateExercise.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateExercise.isPending}
              data-testid="update-exercise-submit"
            >
              {updateExercise.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
