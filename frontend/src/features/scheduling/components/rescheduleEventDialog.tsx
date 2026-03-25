"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
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
import { Textarea } from "@/shared/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Calendar } from "@/shared/ui/calendar"
import { TimeSelect } from "@/shared/ui/time-select"
import { cn } from "@/lib/utils"
import { ConflictWarningDialog } from "./conflictWarningDialog"
import { useUpdateEvent } from "@/features/scheduling/hooks/useUpdateEvent"
import { useEnumAttendanceTypes } from "@/features/shared/hooks/useEnumAttendanceTypes"
import type { UnifiedCalendarEntry } from "@/features/scheduling/types/scheduling.types"

const schema = z
  .object({
    date: z.string().min(1, "Data obrigatoria"),
    startTime: z.string().min(1, "Horario de inicio obrigatorio"),
    endTime: z.string().min(1, "Horario de termino obrigatorio"),
    appointmentType: z.enum(["online", "presential"]),
    meetingUrl: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.appointmentType === "online") return !!data.meetingUrl
      return true
    },
    { message: "Link da reuniao e obrigatorio para consultas online", path: ["meetingUrl"] }
  )
  .refine(
    (data) => {
      if (data.appointmentType === "presential") return !!data.location
      return true
    },
    { message: "Local e obrigatorio para consultas presenciais", path: ["location"] }
  )

type FormData = z.infer<typeof schema>

interface RescheduleEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: UnifiedCalendarEntry
}

export function RescheduleEventDialog({
  open,
  onOpenChange,
  entry,
}: RescheduleEventDialogProps) {
  const [conflictOpen, setConflictOpen] = useState(false)
  const { data: attendanceTypes } = useEnumAttendanceTypes()

  const update = useUpdateEvent({
    onSuccess: () => {
      onOpenChange(false)
      setConflictOpen(false)
    },
  })

  const originalStart = new Date(entry.startAt)
  const originalEnd = new Date(entry.endAt)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(originalStart, "yyyy-MM-dd"),
      startTime: format(originalStart, "HH:mm"),
      endTime: format(originalEnd, "HH:mm"),
      appointmentType: (entry.appointmentType as "online" | "presential") ?? "presential",
      meetingUrl: entry.meetingUrl ?? "",
      location: entry.location ?? "",
      notes: entry.notes ?? "",
    },
  })

  const appointmentType = watch("appointmentType")

  useEffect(() => {
    if (open) {
      reset({
        date: format(originalStart, "yyyy-MM-dd"),
        startTime: format(originalStart, "HH:mm"),
        endTime: format(originalEnd, "HH:mm"),
        appointmentType: (entry.appointmentType as "online" | "presential") ?? "presential",
        meetingUrl: entry.meetingUrl ?? "",
        location: entry.location ?? "",
        notes: entry.notes ?? "",
      })
      update.clearConflicts()
      setConflictOpen(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (update.hasConflicts) {
      setConflictOpen(true)
    }
  }, [update.hasConflicts])

  function onSubmit(data: FormData) {
    const startAt = `${data.date}T${data.startTime}:00`
    const endAt = `${data.date}T${data.endTime}:00`
    update.updateWithConflictCheck(entry.id, {
      startAt,
      endAt,
      appointmentType: data.appointmentType,
      meetingUrl: data.appointmentType === "online" ? data.meetingUrl : undefined,
      location: data.appointmentType === "presential" ? data.location : undefined,
      notes: data.notes || undefined,
    })
  }

  function handleForceUpdate() {
    update.forceUpdate()
    setConflictOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg" data-testid="reschedule-dialog">
          <DialogHeader>
            <DialogTitle>Reagendar</DialogTitle>
            <DialogDescription>
              Evento original: {format(originalStart, "PPP", { locale: ptBR })},{" "}
              {format(originalStart, "HH:mm")} – {format(originalEnd, "HH:mm")}
              {entry.studentName && ` com ${entry.studentName}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => {
                  const selectedDate = field.value ? new Date(field.value + "T12:00:00") : undefined
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="reschedule-date-picker"
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )
                }}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
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
              <Label>Tipo</Label>
              <Controller
                name="appointmentType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="reschedule-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {attendanceTypes?.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {appointmentType === "online" && (
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-meetingUrl">Link da reuniao</Label>
                <Input
                  id="reschedule-meetingUrl"
                  placeholder="https://meet.google.com/..."
                  {...register("meetingUrl")}
                />
                {errors.meetingUrl && (
                  <p className="text-xs text-destructive">{errors.meetingUrl.message}</p>
                )}
              </div>
            )}

            {appointmentType === "presential" && (
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-location">Local</Label>
                <Input
                  id="reschedule-location"
                  placeholder="Ex: Academia Central"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reschedule-notes">Observacoes (opcional)</Label>
              <Textarea
                id="reschedule-notes"
                placeholder="..."
                rows={2}
                {...register("notes")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={update.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={update.isPending}
                data-testid="reschedule-submit"
              >
                {update.isPending ? "Reagendando..." : "Reagendar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConflictWarningDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflicts={update.conflicts}
        onForceCreate={handleForceUpdate}
        isPending={update.isPending}
      />
    </>
  )
}
