"use client"

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
import { Input } from "@/shared/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { useAddWorkoutDay } from "@/features/studentPrograms/hooks/useAddWorkoutDay"

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddWorkoutDayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId: string
}

export function AddWorkoutDayDialog({ open, onOpenChange, programId }: AddWorkoutDayDialogProps) {
  const addWorkoutDay = useAddWorkoutDay({ programId, onOpenChange })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  })

  function handleOpenChange(open: boolean) {
    if (!open) form.reset()
    onOpenChange(open)
  }

  function onSubmit(values: FormValues) {
    addWorkoutDay.mutate({
      name: values.name,
      description: values.description || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar dia de treino</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="day-name">Nome *</FieldLabel>
              <Input
                id="day-name"
                placeholder="Ex: Treino A"
                data-testid="workout-day-name-input"
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="day-description">Descrição</FieldLabel>
              <Input
                id="day-description"
                placeholder="Ex: Foco em membros superiores"
                data-testid="workout-day-description-input"
                {...form.register("description")}
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={addWorkoutDay.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={addWorkoutDay.isPending}>
              {addWorkoutDay.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
