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
import { useCreateEvent } from "@/features/scheduling/hooks/useCreateEvent"
import { useStudents } from "@/features/students/hooks/useStudents"
import { useEnumAttendanceTypes } from "@/features/shared/hooks/useEnumAttendanceTypes"

const schema = z
  .object({
    studentId: z.string().min(1, "Selecione um aluno"),
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

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  defaultStartTime?: string
}

export function CreateEventDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultStartTime,
}: CreateEventDialogProps) {
  const [conflictOpen, setConflictOpen] = useState(false)
  const { data: studentsData } = useStudents({ size: 100, status: "active" })
  const { data: attendanceTypes } = useEnumAttendanceTypes()

  const createEvent = useCreateEvent({
    onOpenChange: (val) => {
      onOpenChange(val)
      if (!val) setConflictOpen(false)
    },
  })

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
      studentId: "",
      date: defaultDate ?? format(new Date(), "yyyy-MM-dd"),
      startTime: defaultStartTime ?? "08:00",
      endTime: "09:00",
      appointmentType: "presential",
      meetingUrl: "",
      location: "",
      notes: "",
    },
  })

  const appointmentType = watch("appointmentType")

  useEffect(() => {
    if (!open) {
      reset()
      createEvent.clearConflicts()
      setConflictOpen(false)
    }
  }, [open, reset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (createEvent.hasConflicts) {
      setConflictOpen(true)
    }
  }, [createEvent.hasConflicts])

  function onSubmit(data: FormData) {
    const startAt = `${data.date}T${data.startTime}:00`
    const endAt = `${data.date}T${data.endTime}:00`
    createEvent.createWithConflictCheck({
      type: "one_off",
      studentId: data.studentId,
      startAt,
      endAt,
      appointmentType: data.appointmentType,
      meetingUrl: data.appointmentType === "online" ? data.meetingUrl : undefined,
      location: data.appointmentType === "presential" ? data.location : undefined,
      notes: data.notes || undefined,
    })
  }

  function handleForceCreate() {
    createEvent.forceCreate()
    setConflictOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo agendamento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="studentId">Aluno</Label>
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="studentId" data-testid="student-select">
                      <SelectValue placeholder="Selecionar aluno..." />
                    </SelectTrigger>
                    <SelectContent>
                      {studentsData?.content.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.studentId && (
                <p className="text-xs text-destructive">{errors.studentId.message}</p>
              )}
            </div>

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
                          data-testid="date-picker-trigger"
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
                    <SelectTrigger data-testid="type-select">
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
                <Label htmlFor="meetingUrl">Link da reuniao</Label>
                <Input
                  id="meetingUrl"
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
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  placeholder="Ex: Academia Central"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-xs text-destructive">{errors.location.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="notes">Observacoes (opcional)</Label>
              <Textarea
                id="notes"
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
                disabled={createEvent.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createEvent.isPending}
                data-testid="create-appointment-submit"
              >
                {createEvent.isPending ? "Criando..." : "Criar agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConflictWarningDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflicts={createEvent.conflicts}
        onForceCreate={handleForceCreate}
        isPending={createEvent.isPending}
      />
    </>
  )
}
