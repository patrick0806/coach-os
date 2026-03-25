"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react"

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
import { cn } from "@/lib/utils"
import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import { useWorkingHours } from "@/features/scheduling/hooks/useWorkingHours"
import { DAY_OF_WEEK_SHORT } from "@/features/scheduling/types/scheduling.types"

interface Break {
  id: string
  start: string
  end: string
}

interface GeneratedPeriod {
  start: string
  end: string
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function generatePeriods(start: string, end: string, breaks: Break[]): GeneratedPeriod[] {
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  if (endMin <= startMin) return []

  const validBreaks = breaks
    .filter((b) => {
      const bStart = timeToMinutes(b.start)
      const bEnd = timeToMinutes(b.end)
      return bEnd > bStart && bStart < endMin && bEnd > startMin
    })
    .map((b) => ({
      start: Math.max(timeToMinutes(b.start), startMin),
      end: Math.min(timeToMinutes(b.end), endMin),
    }))
    .sort((a, b) => a.start - b.start)

  const periods: GeneratedPeriod[] = []
  let cursor = startMin
  for (const br of validBreaks) {
    if (br.start > cursor) periods.push({ start: minutesToTime(cursor), end: minutesToTime(br.start) })
    cursor = Math.max(cursor, br.end)
  }
  if (cursor < endMin) periods.push({ start: minutesToTime(cursor), end: minutesToTime(endMin) })
  return periods
}

function splitPeriodsIntoSlots(periods: GeneratedPeriod[], durationMin: number): GeneratedPeriod[] {
  const slots: GeneratedPeriod[] = []
  for (const period of periods) {
    let cursor = timeToMinutes(period.start)
    const end = timeToMinutes(period.end)
    while (cursor + durationMin <= end) {
      slots.push({ start: minutesToTime(cursor), end: minutesToTime(cursor + durationMin) })
      cursor += durationMin
    }
  }
  return slots
}

interface ClassifiedSlot {
  dayOfWeek: number
  start: string
  end: string
  status: "available" | "conflict_rule"
  reason?: string
}

interface WorkingHoursWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkingHoursWizard({ open, onOpenChange }: WorkingHoursWizardProps) {
  const queryClient = useQueryClient()
  const { data: existingWH = [] } = useWorkingHours()

  const [step, setStep] = useState(1)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [periodStart, setPeriodStart] = useState("08:00")
  const [periodEnd, setPeriodEnd] = useState("18:00")
  const [breaks, setBreaks] = useState<Break[]>([])
  const [slotDuration, setSlotDuration] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const periods = generatePeriods(periodStart, periodEnd, breaks)
  const slots = splitPeriodsIntoSlots(periods, slotDuration)

  const classifiedSlots: ClassifiedSlot[] = selectedDays.flatMap((day) =>
    slots.map((slot) => {
      const slotStart = timeToMinutes(slot.start)
      const slotEnd = timeToMinutes(slot.end)
      const conflict = existingWH.find((wh) => {
        if (wh.dayOfWeek !== day || !wh.isActive) return false
        const rStart = timeToMinutes(wh.startTime)
        const rEnd = timeToMinutes(wh.endTime)
        return slotStart < rEnd && slotEnd > rStart
      })
      if (conflict) {
        return {
          dayOfWeek: day,
          start: slot.start,
          end: slot.end,
          status: "conflict_rule" as const,
          reason: `Conflita com ${conflict.startTime}–${conflict.endTime}`,
        }
      }
      return { dayOfWeek: day, start: slot.start, end: slot.end, status: "available" as const }
    })
  )

  const availableSlots = classifiedSlots.filter((s) => s.status === "available")
  const conflictSlots = classifiedSlots.filter((s) => s.status !== "available")

  function resetWizard() {
    setStep(1)
    setSelectedDays([])
    setPeriodStart("08:00")
    setPeriodEnd("18:00")
    setBreaks([])
    setSlotDuration(60)
    setIsSubmitting(false)
  }

  function handleClose(v: boolean) {
    if (!v) resetWizard()
    onOpenChange(v)
  }

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function addBreak() {
    setBreaks((prev) => [...prev, { id: crypto.randomUUID(), start: "12:00", end: "13:00" }])
  }

  function removeBreak(id: string) {
    setBreaks((prev) => prev.filter((b) => b.id !== id))
  }

  function updateBreak(id: string, field: "start" | "end", value: string) {
    setBreaks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  async function handleConfirm() {
    if (availableSlots.length === 0) return
    setIsSubmitting(true)

    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const items = availableSlots.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.start,
        endTime: slot.end,
        effectiveFrom: today,
      }))

      const result = await schedulingService.bulkCreateWorkingHours(items)

      await queryClient.invalidateQueries({ queryKey: ["working-hours"] })
      await queryClient.invalidateQueries({ queryKey: ["calendar"] })
      await queryClient.invalidateQueries({ queryKey: ["availability"] })

      handleClose(false)

      const created = result.created.length
      const errors = result.errors.length

      if (errors === 0) {
        toast.success(`${created} ${created === 1 ? "horario criado" : "horarios criados"} com sucesso!`)
      } else {
        toast.warning(`${created} criados, ${errors} com erro.`)
      }
    } catch {
      toast.error("Erro ao criar horarios.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const step1Valid = selectedDays.length > 0
  const step2Valid = slots.length > 0
  const displayOrder = [1, 2, 3, 4, 5, 6, 0]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>Configurar disponibilidade em lote</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 text-sm mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center text-xs font-semibold",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : step > s
                      ? "bg-primary/30 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </div>
              {s < 3 && <div className={cn("h-px w-6 bg-border", step > s && "bg-primary/30")} />}
            </div>
          ))}
          <span className="ml-1 text-muted-foreground">
            {step === 1 && "Dias da semana"}
            {step === 2 && "Horarios e pausas"}
            {step === 3 && "Confirmar"}
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Selecione os dias da semana para aplicar a disponibilidade.
            </p>
            <div className="flex gap-2 flex-wrap">
              {displayOrder.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
                    selectedDays.includes(day)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => toggleDay(day)}
                  data-testid={`wizard-day-${day}`}
                >
                  {DAY_OF_WEEK_SHORT[day]}
                </button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedDays.length} {selectedDays.length === 1 ? "dia selecionado" : "dias selecionados"}
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Inicio do periodo</Label>
                <TimeSelect value={periodStart} onChange={setPeriodStart} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim do periodo</Label>
                <TimeSelect value={periodEnd} onChange={setPeriodEnd} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Pausas</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addBreak}>
                  <Plus className="size-3.5 mr-1" />
                  Adicionar pausa
                </Button>
              </div>
              {breaks.map((br) => (
                <div key={br.id} className="flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <TimeSelect value={br.start} onChange={(v) => updateBreak(br.id, "start", v)} />
                    <TimeSelect value={br.end} onChange={(v) => updateBreak(br.id, "end", v)} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeBreak(br.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Duracao do slot</Label>
              <Select value={String(slotDuration)} onValueChange={(v) => setSlotDuration(Number(v))}>
                <SelectTrigger data-testid="slot-duration-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[30, 45, 60, 90, 120].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} minutos</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {slots.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Slots resultantes</Label>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
                    >
                      {p.start}–{p.end}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {availableSlots.length > 0 ? (
                <>
                  <span className="font-medium text-foreground">{availableSlots.length}</span>
                  {" "}{availableSlots.length === 1 ? "slot sera criado" : "slots serao criados"}
                  {conflictSlots.length > 0 && (
                    <>, <span className="font-medium text-amber-600 dark:text-amber-400">{conflictSlots.length}</span>
                      {" "}{conflictSlots.length === 1 ? "ignorado por conflito" : "ignorados por conflito"}</>
                  )}
                </>
              ) : (
                <span className="text-destructive">Todos os slots possuem conflitos.</span>
              )}
            </p>
            <div className="rounded-lg border border-border overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="text-left p-2 font-medium">Dia</th>
                    <th className="text-left p-2 font-medium">Slots</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOrder
                    .filter((d) => selectedDays.includes(d))
                    .map((day) => {
                      const daySlots = classifiedSlots.filter((s) => s.dayOfWeek === day)
                      if (daySlots.length === 0) return null
                      return (
                        <tr key={day} className="border-b border-border/50 last:border-0">
                          <td className="p-2 align-top">{DAY_OF_WEEK_SHORT[day]}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {daySlots.map((s, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-xs",
                                    s.status === "available"
                                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400 line-through"
                                  )}
                                  title={s.reason}
                                >
                                  {s.start}–{s.end}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step > 1 ? setStep((s) => s - 1) : handleClose(false))}
            disabled={isSubmitting}
          >
            {step > 1 ? (
              <><ChevronLeft className="size-4 mr-1" /> Voltar</>
            ) : "Cancelar"}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              data-testid="wizard-next-btn"
            >
              Proximo
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || availableSlots.length === 0}
              data-testid="wizard-confirm-btn"
            >
              {isSubmitting ? "Criando..." : "Confirmar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
