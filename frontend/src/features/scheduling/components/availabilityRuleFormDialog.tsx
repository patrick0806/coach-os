"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { TimeSelect } from "@/shared/ui/time-select"
import { DAY_OF_WEEK_LABELS } from "@/features/scheduling/types/scheduling.types"
import { useCreateAvailabilityRule } from "@/features/scheduling/hooks/useCreateAvailabilityRule"
import { useUpdateAvailabilityRule } from "@/features/scheduling/hooks/useUpdateAvailabilityRule"
import type { AvailabilityRuleItem } from "@/features/scheduling/types/scheduling.types"

const schema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, "Horário de início obrigatório"),
  endTime: z.string().min(1, "Horário de término obrigatório"),
})

type FormData = z.infer<typeof schema>

interface AvailabilityRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: AvailabilityRuleItem
  defaultDayOfWeek?: number
}

export function AvailabilityRuleFormDialog({
  open,
  onOpenChange,
  rule,
  defaultDayOfWeek,
}: AvailabilityRuleFormDialogProps) {
  const isEdit = !!rule
  const create = useCreateAvailabilityRule({ onOpenChange })
  const update = useUpdateAvailabilityRule({ onOpenChange })

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dayOfWeek: rule?.dayOfWeek ?? defaultDayOfWeek ?? 1,
      startTime: rule?.startTime ?? "08:00",
      endTime: rule?.endTime ?? "17:00",
    },
  })

  useEffect(() => {
    if (open && rule) {
      setValue("dayOfWeek", rule.dayOfWeek)
      setValue("startTime", rule.startTime)
      setValue("endTime", rule.endTime)
    } else if (open && defaultDayOfWeek !== undefined) {
      reset({ dayOfWeek: defaultDayOfWeek, startTime: "08:00", endTime: "17:00" })
    } else if (!open) {
      reset({ dayOfWeek: defaultDayOfWeek ?? 1, startTime: "08:00", endTime: "17:00" })
    }
  }, [open, rule, defaultDayOfWeek, setValue, reset])

  function onSubmit(data: FormData) {
    if (isEdit && rule) {
      update.mutate({ id: rule.id, data })
    } else {
      create.mutate(data)
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar horário" : "Adicionar horário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Dia da semana</Label>
            <Controller
              name="dayOfWeek"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger data-testid="day-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OF_WEEK_LABELS.map((label, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <TimeSelect value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.startTime && (
                <p className="text-xs text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Término</Label>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <TimeSelect value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.endTime && (
                <p className="text-xs text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} data-testid="availability-rule-submit">
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
