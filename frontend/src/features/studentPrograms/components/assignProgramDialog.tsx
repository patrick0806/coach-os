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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useAssignProgram } from "@/features/studentPrograms/hooks/useAssignProgram"
import { useProgramTemplates } from "@/features/trainingTemplates/hooks/useProgramTemplates"

const schema = z.object({
  programTemplateId: z.string().optional(),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
})

type FormData = z.infer<typeof schema>

interface AssignProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
}

export function AssignProgramDialog({ open, onOpenChange, studentId }: AssignProgramDialogProps) {
  const { data: templates } = useProgramTemplates({ status: "active", size: 100 }, open)
  const assign = useAssignProgram({ studentId, onOpenChange })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", programTemplateId: undefined },
  })

  const selectedTemplateId = watch("programTemplateId")

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates?.content.find((t) => t.id === selectedTemplateId)
      if (template) setValue("name", template.name)
    }
  }, [selectedTemplateId, templates, setValue])

  function onSubmit(data: FormData) {
    assign.mutate({
      name: data.name,
      programTemplateId: data.programTemplateId || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir programa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Template (opcional)</Label>
            <Select
              value={selectedTemplateId ?? "none"}
              onValueChange={(val) =>
                setValue("programTemplateId", val === "none" ? undefined : val)
              }
            >
              <SelectTrigger data-testid="template-select">
                <SelectValue placeholder="Selecionar template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem template</SelectItem>
                {templates?.content.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="program-name">Nome do programa</Label>
            <Input
              id="program-name"
              placeholder="Ex: Programa de Hipertrofia"
              data-testid="program-name-input"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assign.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={assign.isPending} data-testid="assign-program-submit">
              {assign.isPending ? "Atribuindo..." : "Atribuir programa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
