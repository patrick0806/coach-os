"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useCreateProgressRecord } from "@/features/progress/hooks/useCreateProgressRecord"
import { useUpdateProgressRecord } from "@/features/progress/hooks/useUpdateProgressRecord"
import {
  METRIC_TYPES,
  METRIC_TYPE_LABELS,
  METRIC_TYPE_UNITS,
  type MetricType,
  type ProgressRecord,
} from "@/features/progress/types/progress.types"

const schema = z.object({
  metricType: z.enum([
    "weight",
    "body_fat",
    "waist",
    "chest",
    "hip",
    "bicep",
    "thigh",
  ] as [MetricType, ...MetricType[]]),
  value: z.string().min(1, "Valor é obrigatório").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "Valor deve ser um número positivo",
  ),
  recordedAt: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ProgressRecordFormDialogProps {
  studentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: ProgressRecord
}

export function ProgressRecordFormDialog({
  studentId,
  open,
  onOpenChange,
  record,
}: ProgressRecordFormDialogProps) {
  const isEdit = !!record

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      metricType: "weight",
      value: "",
      recordedAt: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  })

  const selectedMetricType = form.watch("metricType") as MetricType

  useEffect(() => {
    if (record) {
      form.reset({
        metricType: record.metricType,
        value: record.value,
        recordedAt: record.recordedAt
          ? format(new Date(record.recordedAt), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        notes: record.notes ?? "",
      })
    } else {
      form.reset({
        metricType: "weight",
        value: "",
        recordedAt: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      })
    }
  }, [record, form, open])

  const createRecord = useCreateProgressRecord(studentId, () => onOpenChange(false))
  const updateRecord = useUpdateProgressRecord(studentId, () => onOpenChange(false))

  function onSubmit(values: FormValues) {
    const unit = METRIC_TYPE_UNITS[values.metricType as MetricType]
    const numericValue = parseFloat(values.value)
    if (isEdit) {
      updateRecord.mutate({
        id: record.id,
        data: {
          metricType: values.metricType,
          value: numericValue,
          unit,
          recordedAt: new Date(values.recordedAt + "T12:00:00").toISOString(),
          notes: values.notes || undefined,
        },
      })
    } else {
      createRecord.mutate({
        metricType: values.metricType,
        value: numericValue,
        unit,
        recordedAt: new Date(values.recordedAt + "T12:00:00").toISOString(),
        notes: values.notes || undefined,
      })
    }
  }

  const isPending = createRecord.isPending || updateRecord.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar registro" : "Novo registro"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="record-metricType">Métrica</FieldLabel>
              <Select
                value={form.watch("metricType")}
                onValueChange={(val) =>
                  form.setValue("metricType", val as MetricType, { shouldValidate: true })
                }
              >
                <SelectTrigger id="record-metricType">
                  <SelectValue placeholder="Selecione a métrica" />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {METRIC_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.metricType]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="record-value">
                Valor ({METRIC_TYPE_UNITS[selectedMetricType]})
              </FieldLabel>
              <Input
                id="record-value"
                type="number"
                step="0.01"
                placeholder="Ex: 75.5"
                {...form.register("value")}
              />
              <FieldError errors={[form.formState.errors.value]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="record-recordedAt">Data</FieldLabel>
              <Input
                id="record-recordedAt"
                type="date"
                {...form.register("recordedAt")}
              />
              <FieldError errors={[form.formState.errors.recordedAt]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="record-notes">Observações</FieldLabel>
              <Textarea
                id="record-notes"
                placeholder="Observações opcionais..."
                rows={2}
                {...form.register("notes")}
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
