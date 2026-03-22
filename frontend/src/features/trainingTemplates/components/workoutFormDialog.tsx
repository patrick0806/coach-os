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
import { useAddWorkoutTemplate } from "@/features/trainingTemplates/hooks/useAddWorkoutTemplate"
import { useUpdateWorkoutTemplate } from "@/features/trainingTemplates/hooks/useUpdateWorkoutTemplate"
import type { WorkoutTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

const schema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(200, "Nome muito longo"),
})

type FormValues = z.infer<typeof schema>

interface WorkoutFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  workout?: WorkoutTemplateItem
}

export function WorkoutFormDialog({
  open,
  onOpenChange,
  templateId,
  workout,
}: WorkoutFormDialogProps) {
  const isEdit = !!workout

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    if (!open) return
    if (workout) {
      form.reset({ name: workout.name })
    } else {
      form.reset({ name: "" })
    }
  }, [workout, form, open])

  const addWorkout = useAddWorkoutTemplate({ templateId, onOpenChange })
  const updateWorkout = useUpdateWorkoutTemplate(workout?.id ?? "", { templateId, onOpenChange })

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateWorkout.mutate({ name: values.name })
    } else {
      addWorkout.mutate({ name: values.name })
    }
  }

  const isPending = addWorkout.isPending || updateWorkout.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar treino" : "Novo treino"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workout-name">Nome do treino</FieldLabel>
              <Input
                id="workout-name"
                placeholder="Ex: Treino A - Peito e Tríceps..."
                data-testid="workout-name-input"
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} data-testid="workout-submit-button">
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
