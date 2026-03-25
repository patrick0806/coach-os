"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"

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
import { TimeSelect } from "@/shared/ui/time-select"
import { DAY_OF_WEEK_LABELS } from "@/features/scheduling/types/scheduling.types"
import {
  useCreateRecurringSlot,
  useUpdateRecurringSlot,
} from "@/features/scheduling/hooks/useRecurringSlots"
import type { RecurringSlotItem } from "@/features/scheduling/types/scheduling.types"

const schema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, "Horario de inicio obrigatorio"),
  endTime: z.string().min(1, "Horario de termino obrigatorio"),
  location: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface RecurringSlotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  item?: RecurringSlotItem
  defaultDayOfWeek?: number
}

export function RecurringSlotFormDialog({
  open,
  onOpenChange,
  studentId,
  item,
  defaultDayOfWeek,
}: RecurringSlotFormDialogProps) {
  const isEdit = !!item
  const create = useCreateRecurringSlot()
  const update = useUpdateRecurringSlot()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dayOfWeek: item?.dayOfWeek ?? defaultDayOfWeek ?? 1,
      startTime: item?.startTime ?? "08:00",
      endTime: item?.endTime ?? "09:00",
      location: item?.location ?? "",
    },
  })

  useEffect(() => {
    if (open && item) {
      reset({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        location: item.location ?? "",
      })
    } else if (open && defaultDayOfWeek !== undefined) {
      reset({ dayOfWeek: defaultDayOfWeek, startTime: "08:00", endTime: "09:00", location: "" })
    } else if (!open) {
      reset({ dayOfWeek: defaultDayOfWeek ?? 1, startTime: "08:00", endTime: "09:00", location: "" })
    }
  }, [open, item, defaultDayOfWeek, reset])

  function onSubmit(data: FormData) {
    if (isEdit && item) {
      update.mutate(
        {
          id: item.id,
          data: {
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location || null,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      create.mutate(
        {
          type: "booking",
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          effectiveFrom: format(new Date(), "yyyy-MM-dd"),
          studentId,
          location: data.location || undefined,
        },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar horario recorrente" : "Adicionar horario recorrente"}
          </DialogTitle>
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
                  <SelectTrigger data-testid="slot-day-select">
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
              <Label>Inicio</Label>
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
              <Label>Termino</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="location">Local (opcional)</Label>
            <Input
              id="location"
              placeholder="Ex: Academia Central"
              {...register("location")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-testid="recurring-slot-submit"
            >
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
