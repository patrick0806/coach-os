"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { useUpdateExerciseTemplate } from "@/features/trainingTemplates/hooks/useUpdateExerciseTemplate"
import type { ExerciseTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

const schema = z.object({
  sets: z
    .string()
    .min(1, "Séries é obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, "Mínimo 1 série"),
  repetitions: z.string().optional(),
  restSeconds: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ExerciseTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseTemplate: ExerciseTemplateItem | null
  templateId: string
}

export function ExerciseTemplateFormDialog({
  open,
  onOpenChange,
  exerciseTemplate,
  templateId,
}: ExerciseTemplateFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sets: "",
      repetitions: "",
      restSeconds: "",
      duration: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (exerciseTemplate) {
      form.reset({
        sets: String(exerciseTemplate.sets),
        repetitions: exerciseTemplate.repetitions != null ? String(exerciseTemplate.repetitions) : "",
        restSeconds: exerciseTemplate.restSeconds != null ? String(exerciseTemplate.restSeconds) : "",
        duration: exerciseTemplate.duration ?? "",
        notes: exerciseTemplate.notes ?? "",
      })
    } else {
      form.reset({ sets: "", repetitions: "", restSeconds: "", duration: "", notes: "" })
    }
  }, [exerciseTemplate, form, open])

  const updateExerciseTemplate = useUpdateExerciseTemplate(exerciseTemplate?.id ?? "", {
    templateId,
    onOpenChange,
  })

  function onSubmit(values: FormValues) {
    updateExerciseTemplate.mutate({
      sets: Number(values.sets),
      repetitions: values.repetitions ? Number(values.repetitions) : null,
      restSeconds: values.restSeconds ? Number(values.restSeconds) : null,
      duration: values.duration || null,
      notes: values.notes || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar{" "}
            {exerciseTemplate?.exercise.name ?? "exercício"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="et-sets">Séries *</FieldLabel>
                <Input
                  id="et-sets"
                  type="number"
                  min="1"
                  placeholder="Ex: 4"
                  {...form.register("sets")}
                />
                <FieldError errors={[form.formState.errors.sets]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="et-repetitions">Repetições</FieldLabel>
                <Input
                  id="et-repetitions"
                  type="number"
                  min="1"
                  placeholder="Ex: 12"
                  {...form.register("repetitions")}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="et-rest">Descanso (seg)</FieldLabel>
                <Input
                  id="et-rest"
                  type="number"
                  min="0"
                  placeholder="Ex: 60"
                  {...form.register("restSeconds")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="et-duration">Duração</FieldLabel>
                <Input
                  id="et-duration"
                  placeholder="Ex: 00:01:00"
                  {...form.register("duration")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="et-notes">Observações</FieldLabel>
              <Input
                id="et-notes"
                placeholder="Ex: Manter cotovelo fixo..."
                {...form.register("notes")}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateExerciseTemplate.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateExerciseTemplate.isPending}>
              {updateExerciseTemplate.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
