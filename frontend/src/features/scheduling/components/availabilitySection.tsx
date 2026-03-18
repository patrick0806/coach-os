"use client"

import { useState, useMemo, Fragment } from "react"
import { format, parseISO, startOfWeek, endOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, Pencil, Trash2, Ban, Clock, CalendarOff } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { EmptyState } from "@/shared/components/emptyState"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { AvailabilityRuleFormDialog } from "./availabilityRuleFormDialog"
import { AvailabilityExceptionFormDialog } from "./availabilityExceptionFormDialog"
import { useAvailabilityRules } from "@/features/scheduling/hooks/useAvailabilityRules"
import { useDeleteAvailabilityRule } from "@/features/scheduling/hooks/useDeleteAvailabilityRule"
import { useAvailabilityExceptions } from "@/features/scheduling/hooks/useAvailabilityExceptions"
import { useDeleteAvailabilityException } from "@/features/scheduling/hooks/useDeleteAvailabilityException"
import { useCalendar } from "@/features/scheduling/hooks/useCalendar"
import {
  DAY_OF_WEEK_LABELS,
  type AvailabilityRuleItem,
  type CalendarEntry,
} from "@/features/scheduling/types/scheduling.types"

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getOccupantsForRule(rule: AvailabilityRuleItem, entries: CalendarEntry[]) {
  const ruleStart = timeToMinutes(rule.startTime)
  const ruleEnd = timeToMinutes(rule.endTime)

  return entries.filter((entry) => {
    if (entry.type === "exception") return false
    if (!entry.startTime || !entry.endTime) return false
    if (getDay(parseISO(entry.date)) !== rule.dayOfWeek) return false
    const eStart = timeToMinutes(entry.startTime)
    const eEnd = timeToMinutes(entry.endTime)
    return eStart < ruleEnd && eEnd > ruleStart
  })
}

export function AvailabilitySection() {
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [editRule, setEditRule] = useState<AvailabilityRuleItem | undefined>()
  const [defaultDayOfWeek, setDefaultDayOfWeek] = useState<number | undefined>()
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null)

  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false)
  const [deleteExceptionId, setDeleteExceptionId] = useState<string | null>(null)

  const { data: rules = [], isLoading: loadingRules } = useAvailabilityRules()
  const deleteRule = useDeleteAvailabilityRule()

  const { data: exceptions = [], isLoading: loadingExceptions } = useAvailabilityExceptions()
  const deleteException = useDeleteAvailabilityException()

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), [])
  const weekEnd = useMemo(() => endOfWeek(new Date(), { weekStartsOn: 1 }), [])
  const { data: calendarEntries = [] } = useCalendar(weekStart, weekEnd)

  // Group rules by dayOfWeek, sorted by startTime within each day
  const displayOrder = [1, 2, 3, 4, 5, 6, 0]
  const groupedRules = useMemo(() => {
    const groups: { dayOfWeek: number; rules: AvailabilityRuleItem[] }[] = []
    for (const day of displayOrder) {
      const dayRules = rules
        .filter((r) => r.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
      if (dayRules.length > 0) {
        groups.push({ dayOfWeek: day, rules: dayRules })
      }
    }
    return groups
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules])

  function handleEditRule(rule: AvailabilityRuleItem) {
    setEditRule(rule)
    setDefaultDayOfWeek(undefined)
    setRuleDialogOpen(true)
  }

  function handleAddRuleForDay(day: number) {
    setEditRule(undefined)
    setDefaultDayOfWeek(day)
    setRuleDialogOpen(true)
  }

  function handleRuleDialogClose(open: boolean) {
    setRuleDialogOpen(open)
    if (!open) {
      setEditRule(undefined)
      setDefaultDayOfWeek(undefined)
    }
  }

  return (
    <>
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Horários disponíveis</TabsTrigger>
          <TabsTrigger value="exceptions">Datas bloqueadas</TabsTrigger>
        </TabsList>

        {/* Availability Rules */}
        <TabsContent value="rules" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Defina os horários em que você está disponível por dia da semana.
            </p>
            <Button size="sm" onClick={() => setRuleDialogOpen(true)} data-testid="add-rule-btn">
              <Plus className="size-4 mr-1.5" />
              Adicionar horário
            </Button>
          </div>

          {loadingRules ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : rules.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhum horário definido"
              description="Adicione seus horários de atendimento para que seus alunos possam solicitar agendamentos."
            />
          ) : (
            <div className="space-y-3">
              {groupedRules.map(({ dayOfWeek, rules: dayRules }) => (
                <div
                  key={dayOfWeek}
                  className="rounded-lg border border-border p-3"
                  data-testid="availability-day-group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{DAY_OF_WEEK_LABELS[dayOfWeek]}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleAddRuleForDay(dayOfWeek)}
                      data-testid="add-rule-day-btn"
                    >
                      <Plus className="size-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dayRules.map((rule) => {
                      const occupants = getOccupantsForRule(rule, calendarEntries)
                      const isOccupied = occupants.length > 0

                      return (
                        <div
                          key={rule.id}
                          className={`group inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm ${
                            isOccupied
                              ? "border-amber-500/40 bg-amber-500/5"
                              : "border-border"
                          }`}
                          data-testid="availability-rule-item"
                        >
                          {isOccupied && (
                            <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                          )}
                          <span className="font-medium">
                            {rule.startTime} – {rule.endTime}
                          </span>
                          <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-muted"
                              onClick={() => handleEditRule(rule)}
                              data-testid="edit-rule-btn"
                            >
                              <Pencil className="size-3 text-muted-foreground" />
                            </button>
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-destructive/10"
                              onClick={() => setDeleteRuleId(rule.id)}
                              data-testid="delete-rule-btn"
                            >
                              <Trash2 className="size-3 text-destructive" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Availability Exceptions */}
        <TabsContent value="exceptions" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Bloqueie datas específicas em que você não estará disponível.
            </p>
            <Button
              size="sm"
              onClick={() => setExceptionDialogOpen(true)}
              data-testid="add-exception-btn"
            >
              <Ban className="size-4 mr-1.5" />
              Bloquear data
            </Button>
          </div>

          {loadingExceptions ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : exceptions.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="Nenhuma data bloqueada"
              description="Bloqueie datas de feriados, férias ou qualquer indisponibilidade."
            />
          ) : (
            <div className="space-y-2">
              {[...exceptions]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((exc) => (
                  <div
                    key={exc.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                    data-testid="availability-exception-item"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {format(parseISO(exc.date), "PPP", { locale: ptBR })}
                      </p>
                      {exc.reason && (
                        <p className="text-xs text-muted-foreground">{exc.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteExceptionId(exc.id)}
                      data-testid="delete-exception-btn"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AvailabilityRuleFormDialog
        open={ruleDialogOpen}
        onOpenChange={handleRuleDialogClose}
        rule={editRule}
        defaultDayOfWeek={defaultDayOfWeek}
      />

      <AvailabilityExceptionFormDialog
        open={exceptionDialogOpen}
        onOpenChange={setExceptionDialogOpen}
      />

      {/* Delete Rule confirm */}
      <AlertDialog
        open={!!deleteRuleId}
        onOpenChange={(v) => { if (!v) setDeleteRuleId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover horário?</AlertDialogTitle>
            <AlertDialogDescription>
              Este horário de disponibilidade será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteRuleId) deleteRule.mutate(deleteRuleId)
                setDeleteRuleId(null)
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Exception confirm */}
      <AlertDialog
        open={!!deleteExceptionId}
        onOpenChange={(v) => { if (!v) setDeleteExceptionId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desbloquear data?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta data voltará a ficar disponível para agendamentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteExceptionId) deleteException.mutate(deleteExceptionId)
                setDeleteExceptionId(null)
              }}
            >
              Desbloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
