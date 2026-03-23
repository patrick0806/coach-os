"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import axios from "axios"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  useCreateTrainingSchedule,
  useUpdateTrainingSchedule,
} from "@/features/scheduling/hooks/useTrainingSchedules"
import type { TrainingScheduleItem } from "@/features/scheduling/types/scheduling.types"
import { DAY_OF_WEEK_LABELS } from "@/features/scheduling/types/scheduling.types"

const schema = z
  .object({
    dayOfWeek: z.string().min(1, "Selecione um dia"),
    startTime: z.string().min(1, "Horário inicial obrigatório"),
    endTime: z.string().min(1, "Horário final obrigatório"),
    location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime
      }
      return true
    },
    { message: "Horário final deve ser após o inicial", path: ["endTime"] }
  )

type FormValues = z.infer<typeof schema>

interface TrainingScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  schedule?: TrainingScheduleItem
}

export function TrainingScheduleFormDialog({
  open,
  onOpenChange,
  studentId,
  schedule,
}: TrainingScheduleFormDialogProps) {
  const isEdit = !!schedule

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      location: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (schedule) {
      form.reset({
        dayOfWeek: String(schedule.dayOfWeek),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        location: schedule.location ?? "",
      })
    } else {
      form.reset({
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        location: "",
      })
    }
  }, [schedule, form, open])

  const createSchedule = useCreateTrainingSchedule(studentId)
  const updateSchedule = useUpdateTrainingSchedule(studentId)

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateSchedule.mutateAsync({
          id: schedule!.id,
          data: {
            dayOfWeek: Number(values.dayOfWeek),
            startTime: values.startTime,
            endTime: values.endTime,
            location: values.location || null,
          },
        })
        toast.success("Horário atualizado com sucesso!")
      } else {
        await createSchedule.mutateAsync({
          dayOfWeek: Number(values.dayOfWeek),
          startTime: values.startTime,
          endTime: values.endTime,
          location: values.location || undefined,
        })
        toast.success("Horário adicionado com sucesso!")
      }
      onOpenChange(false)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao salvar horário")
        : "Erro ao salvar horário"
      toast.error(message)
    }
  }

  const isPending = createSchedule.isPending || updateSchedule.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar horário" : "Novo horário de treino"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="dayOfWeek">Dia da semana</FieldLabel>
              <Select
                value={form.watch("dayOfWeek")}
                onValueChange={(val) => form.setValue("dayOfWeek", val)}
              >
                <SelectTrigger id="dayOfWeek">
                  <SelectValue placeholder="Selecionar dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OF_WEEK_LABELS.map((label, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.dayOfWeek]} />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="startTime">Início</FieldLabel>
                <Input
                  id="startTime"
                  type="time"
                  {...form.register("startTime")}
                />
                <FieldError errors={[form.formState.errors.startTime]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="endTime">Fim</FieldLabel>
                <Input
                  id="endTime"
                  type="time"
                  {...form.register("endTime")}
                />
                <FieldError errors={[form.formState.errors.endTime]} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="location">Local (opcional)</FieldLabel>
              <Input
                id="location"
                placeholder="Ex: Academia XYZ"
                {...form.register("location")}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
