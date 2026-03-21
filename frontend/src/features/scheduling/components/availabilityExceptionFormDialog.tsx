"use client"

import { startTransition, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, eachDayOfInterval, parseISO } from "date-fns"
import { toast } from "sonner"

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
import { useCreateAvailabilityException } from "@/features/scheduling/hooks/useCreateAvailabilityException"
import { useQueryClient } from "@tanstack/react-query"
import { schedulingService } from "@/features/scheduling/services/scheduling.service"
import { cn } from "@/lib/utils"

const singleSchema = z.object({
  date: z.string().min(1, "Data obrigatória"),
  reason: z.string().optional(),
})

const rangeSchema = z.object({
  startDate: z.string().min(1, "Data inicial obrigatória"),
  endDate: z.string().min(1, "Data final obrigatória"),
  reason: z.string().optional(),
})

type SingleForm = z.infer<typeof singleSchema>
type RangeForm = z.infer<typeof rangeSchema>

interface AvailabilityExceptionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AvailabilityExceptionFormDialog({
  open,
  onOpenChange,
}: AvailabilityExceptionFormDialogProps) {
  const [isRange, setIsRange] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const create = useCreateAvailabilityException({ onOpenChange })

  const singleForm = useForm<SingleForm>({
    resolver: zodResolver(singleSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      reason: "",
    },
  })

  const rangeForm = useForm<RangeForm>({
    resolver: zodResolver(rangeSchema),
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      reason: "",
    },
  })

  useEffect(() => {
    if (!open) {
      singleForm.reset()
      rangeForm.reset()
      startTransition(() => setIsRange(false))
    }
  }, [open, singleForm, rangeForm])

  function onSubmitSingle(data: SingleForm) {
    create.mutate({
      date: data.date,
      reason: data.reason || undefined,
    })
  }

  async function onSubmitRange(data: RangeForm) {
    if (data.endDate < data.startDate) {
      rangeForm.setError("endDate", { message: "Data final deve ser depois da inicial" })
      return
    }

    const days = eachDayOfInterval({
      start: parseISO(data.startDate),
      end: parseISO(data.endDate),
    })

    setIsSubmitting(true)
    const results = await Promise.allSettled(
      days.map((day) =>
        schedulingService.createAvailabilityException({
          date: format(day, "yyyy-MM-dd"),
          reason: data.reason || undefined,
        })
      )
    )

    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    await queryClient.invalidateQueries({ queryKey: ["availability-exceptions"] })
    await queryClient.invalidateQueries({ queryKey: ["calendar"] })
    setIsSubmitting(false)
    onOpenChange(false)

    if (failed === 0) {
      toast.success(`${succeeded} ${succeeded === 1 ? "dia bloqueado" : "dias bloqueados"} com sucesso!`)
    } else {
      toast.warning(`${succeeded} bloqueados, ${failed} já existiam ou ocorreram erros.`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear data</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex rounded-md border border-border overflow-hidden text-sm">
          <button
            type="button"
            className={cn(
              "flex-1 py-1.5 transition-colors",
              !isRange ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
            )}
            onClick={() => setIsRange(false)}
          >
            Dia único
          </button>
          <button
            type="button"
            className={cn(
              "flex-1 py-1.5 transition-colors",
              isRange ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
            )}
            onClick={() => setIsRange(true)}
          >
            Intervalo de datas
          </button>
        </div>

        {!isRange ? (
          <form onSubmit={singleForm.handleSubmit(onSubmitSingle)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="block-date">Data</Label>
              <Input id="block-date" type="date" {...singleForm.register("date")} />
              {singleForm.formState.errors.date && (
                <p className="text-xs text-destructive">{singleForm.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="block-reason">Motivo (opcional)</Label>
              <Input
                id="block-reason"
                placeholder="Ex: Feriado, férias..."
                {...singleForm.register("reason")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={create.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending} data-testid="block-date-submit">
                {create.isPending ? "Bloqueando..." : "Bloquear data"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={rangeForm.handleSubmit(onSubmitRange)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="block-start-date">Data inicial</Label>
                <Input id="block-start-date" type="date" {...rangeForm.register("startDate")} />
                {rangeForm.formState.errors.startDate && (
                  <p className="text-xs text-destructive">{rangeForm.formState.errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="block-end-date">Data final</Label>
                <Input id="block-end-date" type="date" {...rangeForm.register("endDate")} />
                {rangeForm.formState.errors.endDate && (
                  <p className="text-xs text-destructive">{rangeForm.formState.errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="block-range-reason">Motivo (opcional)</Label>
              <Input
                id="block-range-reason"
                placeholder="Ex: Férias, viagem..."
                {...rangeForm.register("reason")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="block-date-submit">
                {isSubmitting ? "Bloqueando..." : "Bloquear período"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
