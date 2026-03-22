"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { Input } from "@/shared/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Calendar } from "@/shared/ui/calendar"
import { TimeSelect } from "@/shared/ui/time-select"
import { cn } from "@/lib/utils"
import { ConflictWarningDialog } from "./conflictWarningDialog"
import { useRescheduleTraining } from "@/features/scheduling/hooks/useRescheduleTraining"
import type { CalendarEntry } from "@/features/scheduling/types/scheduling.types"

const schema = z.object({
  newDate: z.string().min(1, "Data obrigatória"),
  newStartTime: z.string().min(1, "Horário de início obrigatório"),
  newEndTime: z.string().min(1, "Horário de término obrigatório"),
  newLocation: z.string().optional(),
  reason: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface RescheduleTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: CalendarEntry
}

export function RescheduleTrainingDialog({
  open,
  onOpenChange,
  entry,
}: RescheduleTrainingDialogProps) {
  const [conflictOpen, setConflictOpen] = useState(false)

  const reschedule = useRescheduleTraining({
    onSuccess: () => {
      onOpenChange(false)
      setConflictOpen(false)
    },
  })

  const originalDate = parseISO(entry.date)
  const weekStart = startOfWeek(originalDate, { weekStartsOn: 1 })
  const weekEndDate = endOfWeek(originalDate, { weekStartsOn: 1 })

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newDate: entry.date,
      newStartTime: entry.startTime ?? "",
      newEndTime: entry.endTime ?? "",
      newLocation: entry.location ?? "",
      reason: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        newDate: entry.date,
        newStartTime: entry.startTime ?? "",
        newEndTime: entry.endTime ?? "",
        newLocation: entry.location ?? "",
        reason: "",
      })
      reschedule.clearConflicts()
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset dialog state when opening
      setConflictOpen(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reschedule.hasConflicts) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync conflict dialog with hook state
      setConflictOpen(true)
    }
  }, [reschedule.hasConflicts])

  function onSubmit(data: FormData) {
    reschedule.rescheduleWithConflictCheck(entry.sourceId, {
      originalDate: entry.date,
      newDate: data.newDate,
      newStartTime: data.newStartTime,
      newEndTime: data.newEndTime,
      newLocation: data.newLocation || undefined,
      reason: data.reason || undefined,
    })
  }

  function handleForceReschedule() {
    reschedule.forceReschedule()
    setConflictOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg" data-testid="reschedule-training-dialog">
          <DialogHeader>
            <DialogTitle>Reagendar treino</DialogTitle>
            <DialogDescription>
              Treino original: {format(originalDate, "PPP", { locale: ptBR })},{" "}
              {entry.startTime} – {entry.endTime} com {entry.studentName ?? "Aluno"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date — limited to same week */}
            <div className="space-y-1.5">
              <Label>Nova data (mesma semana)</Label>
              <Controller
                name="newDate"
                control={control}
                render={({ field }) => {
                  const selectedDate = field.value ? parseISO(field.value) : undefined
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="training-reschedule-date-picker"
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP", { locale: ptBR })
                            : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(d) => {
                            if (d) field.onChange(format(d, "yyyy-MM-dd"))
                          }}
                          locale={ptBR}
                          fromDate={weekStart}
                          toDate={weekEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
              {errors.newDate && (
                <p className="text-xs text-destructive">{errors.newDate.message}</p>
              )}
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Início</Label>
                <Controller
                  name="newStartTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSelect value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.newStartTime && (
                  <p className="text-xs text-destructive">{errors.newStartTime.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Término</Label>
                <Controller
                  name="newEndTime"
                  control={control}
                  render={({ field }) => (
                    <TimeSelect value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.newEndTime && (
                  <p className="text-xs text-destructive">{errors.newEndTime.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="training-location">Local (opcional)</Label>
              <Input
                id="training-location"
                placeholder="Ex: Academia Central"
                {...register("newLocation")}
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label htmlFor="training-reason">Motivo (opcional)</Label>
              <Input
                id="training-reason"
                placeholder="Ex: Aluno pediu para trocar o dia"
                {...register("reason")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={reschedule.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={reschedule.isPending}
                data-testid="training-reschedule-submit"
              >
                {reschedule.isPending ? "Reagendando..." : "Reagendar treino"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConflictWarningDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflicts={reschedule.conflicts}
        onForceCreate={handleForceReschedule}
        isPending={reschedule.isPending}
      />
    </>
  )
}
