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
import { Textarea } from "@/shared/ui/textarea"
import { useCreateProgramTemplate } from "@/features/trainingTemplates/hooks/useCreateProgramTemplate"
import { useUpdateProgramTemplate } from "@/features/trainingTemplates/hooks/useUpdateProgramTemplate"
import type { ProgramTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

const schema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres").max(200, "Nome muito longo"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ProgramTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: ProgramTemplateItem
}

export function ProgramTemplateFormDialog({
  open,
  onOpenChange,
  template,
}: ProgramTemplateFormDialogProps) {
  const isEdit = !!template

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description ?? "",
      })
    } else {
      form.reset({ name: "", description: "" })
    }
  }, [template, form])

  const createTemplate = useCreateProgramTemplate({ onOpenChange })
  const updateTemplate = useUpdateProgramTemplate(template?.id ?? "", { onOpenChange })

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateTemplate.mutate({
        name: values.name,
        description: values.description || null,
      })
    } else {
      createTemplate.mutate({
        name: values.name,
        description: values.description || undefined,
      })
    }
  }

  const isPending = createTemplate.isPending || updateTemplate.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar programa" : "Novo programa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="template-name">Nome</FieldLabel>
              <Input
                id="template-name"
                placeholder="Ex: Hipertrofia - 3x por semana..."
                data-testid="template-name-input"
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="template-description">Descrição</FieldLabel>
              <Textarea
                id="template-description"
                placeholder="Descreva o objetivo do programa..."
                rows={3}
                data-testid="template-description-input"
                {...form.register("description")}
              />
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
            <Button type="submit" disabled={isPending} data-testid="template-submit-button">
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
