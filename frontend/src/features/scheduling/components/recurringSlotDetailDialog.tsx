"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MapPin, CalendarX, CalendarClock } from "lucide-react"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Label } from "@/shared/ui/label"
import { TimeSelect } from "@/shared/ui/time-select"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { ConflictWarningDialog } from "./conflictWarningDialog"
import { useCreateEvent } from "@/features/scheduling/hooks/useCreateEvent"
import type { UnifiedCalendarEntry } from "@/features/scheduling/types/scheduling.types"

interface RecurringSlotDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: UnifiedCalendarEntry | null
}

export function RecurringSlotDetailDialog({
  open,
  onOpenChange,
  entry,
}: RecurringSlotDetailDialogProps) {
  const [mode, setMode] = useState<"view" | "reschedule">("view")
  const [newDate, setNewDate] = useState<Date | undefined>()
  const [newStartTime, setNewStartTime] = useState("08:00")
  const [newEndTime, setNewEndTime] = useState("09:00")
  const [conflictOpen, setConflictOpen] = useState(false)

  const skipEvent = useCreateEvent({
    onOpenChange: (val) => {
      if (!val) handleClose()
    },
  })

  const rescheduleEvent = useCreateEvent({
    onOpenChange: (val) => {
      if (!val) {
        handleClose()
        setConflictOpen(false)
      }
    },
  })

  function handleClose() {
    onOpenChange(false)
    setMode("view")
    setNewDate(undefined)
    setNewStartTime("08:00")
    setNewEndTime("09:00")
    skipEvent.clearConflicts()
    rescheduleEvent.clearConflicts()
    setConflictOpen(false)
  }

  if (!entry) return null

  const start = new Date(entry.startAt)
  const end = new Date(entry.endAt)

  function handleSkip() {
    if (!entry) return
    skipEvent.createWithConflictCheck({
      type: "override",
      recurringSlotId: entry.recurringSlotId ?? entry.id,
      originalStartAt: entry.startAt,
      startAt: entry.startAt,
      endAt: entry.endAt,
      status: "cancelled",
      studentId: entry.studentId ?? undefined,
    })
  }

  function handleReschedule() {
    if (!entry || !newDate) return
    const dateStr = format(newDate, "yyyy-MM-dd")
    const startAt = `${dateStr}T${newStartTime}:00`
    const endAt = `${dateStr}T${newEndTime}:00`
    rescheduleEvent.createWithConflictCheck({
      type: "override",
      recurringSlotId: entry.recurringSlotId ?? entry.id,
      originalStartAt: entry.startAt,
      startAt,
      endAt,
      studentId: entry.studentId ?? undefined,
      location: entry.location ?? undefined,
    })
  }

  function handleForceReschedule() {
    rescheduleEvent.forceCreate()
    setConflictOpen(false)
  }

  useEffect(() => {
    if (rescheduleEvent.hasConflicts) {
      setConflictOpen(true)
    }
  }, [rescheduleEvent.hasConflicts])

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "view" ? "Treino recorrente" : "Reagendar ocorrencia"}
            </DialogTitle>
          </DialogHeader>

          {mode === "view" && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Aluno:</span>{" "}
                  {entry.studentName ?? "—"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Data:</span>{" "}
                  {format(start, "PPP", { locale: ptBR })}
                </p>
                <p>
                  <span className="font-medium text-foreground">Horario:</span>{" "}
                  {format(start, "HH:mm")} – {format(end, "HH:mm")}
                </p>
                {entry.location && (
                  <p className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    <span className="font-medium text-foreground">Local:</span>{" "}
                    {entry.location}
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={skipEvent.isPending}
                >
                  <CalendarX className="size-4 mr-1.5" />
                  {skipEvent.isPending ? "Pulando..." : "Pular ocorrencia"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMode("reschedule")
                    setNewDate(start)
                    setNewStartTime(format(start, "HH:mm"))
                    setNewEndTime(format(end, "HH:mm"))
                  }}
                  disabled={skipEvent.isPending}
                >
                  <CalendarClock className="size-4 mr-1.5" />
                  Reagendar
                </Button>
              </DialogFooter>
            </div>
          )}

          {mode === "reschedule" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nova data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {newDate ? format(newDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Inicio</Label>
                  <TimeSelect value={newStartTime} onChange={setNewStartTime} />
                </div>
                <div className="space-y-1.5">
                  <Label>Termino</Label>
                  <TimeSelect value={newEndTime} onChange={setNewEndTime} />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMode("view")}
                  disabled={rescheduleEvent.isPending}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleReschedule}
                  disabled={rescheduleEvent.isPending || !newDate}
                >
                  {rescheduleEvent.isPending ? "Reagendando..." : "Confirmar"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConflictWarningDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        conflicts={rescheduleEvent.conflicts}
        onForceCreate={handleForceReschedule}
        isPending={rescheduleEvent.isPending}
      />
    </>
  )
}
