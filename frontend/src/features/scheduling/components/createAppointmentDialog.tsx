"use client"

import { useEffect, useState } from "react"
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
import { Textarea } from "@/shared/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { TimeSelect } from "@/shared/ui/time-select"
import { ConflictWarningDialog } from "./conflictWarningDialog"
import { useCreateAppointment } from "@/features/scheduling/hooks/useCreateAppointment"
import { useStudents } from "@/features/students/hooks/useStudents"

const schema = z
  .object({
    studentId: z.string().min(1, "Selecione um aluno"),
    date: z.string().min(1, "Data obrigatória"),
    startTime: z.string().min(1, "Horário de início obrigatório"),
    endTime: z.string().min(1, "Horário de término obrigatório"),
    type: z.enum(["online", "presential"]),
    meetingUrl: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "online") return !!data.meetingUrl
      return true
    },
    { message: "Link da reunião é obrigatório para consultas online", path: ["meetingUrl"] }
  )
  .refine(
    (data) => {
      if (data.type === "presential") return !!data.location
      return true
    },
    { message: "Local é obrigatório para consultas presenciais", path: ["location"] }
  )

type FormData = z.infer<typeof schema>

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  defaultStartTime?: string
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultStartTime,
}: CreateAppointmentDialogProps) {
  const [conflictOpen, setConflictOpen] = useState(false)
  const { data: studentsData } = useStudents({ size: 100, status: "active" })

  const createAppointment = useCreateAppointment({
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
      type: "presential",
      meetingUrl: "",
      location: "",
      notes: "",
    },
  })

  const appointmentType = watch("type")

  useEffect(() => {
    if (!open) {
      reset()
      createAppointment.clearConflicts()
      setConflictOpen(false)
    }
  }, [open, reset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (createAppointment.hasConflicts) {
      setConflictOpen(true)
    }
  }, [createAppointment.hasConflicts])

  function onSubmit(data: FormData) {
    const startAt = `${data.date}T${data.startTime}:00`
    const endAt = `${data.date}T${data.endTime}:00`
    createAppointment.createWithConflictCheck({
      studentId: data.studentId,
      startAt,
      endAt,
      type: data.type,
      meetingUrl: data.type === "online" ? data.meetingUrl : undefined,
      location: data.type === "presential" ? data.location : undefined,
      notes: data.notes || undefined,
    })
  }

  function handleForceCreate() {
    createAppointment.forceCreate()
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
            {/* Student */}
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

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
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
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presential">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Meeting URL or location */}
            {appointmentType === "online" && (
              <div className="space-y-1.5">
                <Label htmlFor="meetingUrl">Link da reunião</Label>
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

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações (opcional)</Label>
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
                disabled={createAppointment.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createAppointment.isPending}
                data-testid="create-appointment-submit"
              >
                {createAppointment.isPending ? "Criando..." : "Criar agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConflictWarningDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflicts={createAppointment.conflicts}
        onForceCreate={handleForceCreate}
        isPending={createAppointment.isPending}
      />
    </>
  )
}
