"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, parseISO } from "date-fns"
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
import { useRescheduleAppointment } from "@/features/scheduling/hooks/useRescheduleAppointment"
import { useEnumAttendanceTypes } from "@/features/shared/hooks/useEnumAttendanceTypes"
import type { AppointmentItem } from "@/features/scheduling/types/scheduling.types"

const schema = z
  .object({
    date: z.string().min(1, "Data obrigatória"),
    startTime: z.string().min(1, "Horário de início obrigatório"),
    endTime: z.string().min(1, "Horário de término obrigatório"),
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
    { message: "Link da reunião é obrigatório para consultas online", path: ["meetingUrl"] }
  )
  .refine(
    (data) => {
      if (data.appointmentType === "presential") return !!data.location
      return true
    },
    { message: "Local é obrigatório para consultas presenciais", path: ["location"] }
  )

type FormData = z.infer<typeof schema>

interface RescheduleAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentItem
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
}: RescheduleAppointmentDialogProps) {
  const [conflictOpen, setConflictOpen] = useState(false)
  const { data: attendanceTypes } = useEnumAttendanceTypes()

  const reschedule = useRescheduleAppointment({
    onSuccess: () => {
      onOpenChange(false)
      setConflictOpen(false)
    },
  })

  const originalStart = parseISO(appointment.startAt)
  const originalEnd = parseISO(appointment.endAt)

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
      appointmentType: appointment.type,
      meetingUrl: appointment.meetingUrl ?? "",
      location: appointment.location ?? "",
      notes: appointment.notes ?? "",
    },
  })

  const appointmentType = watch("appointmentType")

  useEffect(() => {
    if (open) {
      reset({
        date: format(originalStart, "yyyy-MM-dd"),
        startTime: format(originalStart, "HH:mm"),
        endTime: format(originalEnd, "HH:mm"),
        appointmentType: appointment.type,
        meetingUrl: appointment.meetingUrl ?? "",
        location: appointment.location ?? "",
        notes: appointment.notes ?? "",
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
    const startAt = `${data.date}T${data.startTime}:00`
    const endAt = `${data.date}T${data.endTime}:00`
    reschedule.rescheduleWithConflictCheck(appointment.id, {
      startAt,
      endAt,
      appointmentType: data.appointmentType !== appointment.type ? data.appointmentType : undefined,
      meetingUrl: data.appointmentType === "online" ? data.meetingUrl : undefined,
      location: data.appointmentType === "presential" ? data.location : undefined,
      notes: data.notes || undefined,
    })
  }

  function handleForceReschedule() {
    reschedule.forceReschedule()
    setConflictOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg" data-testid="reschedule-dialog">
          <DialogHeader>
            <DialogTitle>Reagendar</DialogTitle>
            <DialogDescription>
              Agendamento original: {format(originalStart, "PPP", { locale: ptBR })},{" "}
              {format(originalStart, "HH:mm")} – {format(originalEnd, "HH:mm")} com{" "}
              {appointment.studentName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Controller
                name="date"
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

            {/* Times */}
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

            {/* Type */}
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

            {/* Meeting URL or location */}
            {appointmentType === "online" && (
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-meetingUrl">Link da reunião</Label>
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

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-notes">Observações (opcional)</Label>
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
                disabled={reschedule.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={reschedule.isPending}
                data-testid="reschedule-submit"
              >
                {reschedule.isPending ? "Reagendando..." : "Reagendar"}
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
