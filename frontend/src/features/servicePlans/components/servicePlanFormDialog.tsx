"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useCreateServicePlan } from "@/features/servicePlans/hooks/useCreateServicePlan"
import { useUpdateServicePlan } from "@/features/servicePlans/hooks/useUpdateServicePlan"
import { type ServicePlanItem } from "@/features/servicePlans/types/servicePlans.types"
import { useEnumAttendanceTypes } from "@/features/shared/hooks/useEnumAttendanceTypes"

// Formats an integer (cents) as BRL currency string
function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

// Converts a decimal price string (e.g. "299.90") to integer cents
function priceToCents(price: string): number {
  return Math.round(parseFloat(price) * 100)
}

interface CurrencyInputProps {
  id?: string
  cents: number
  onChange: (cents: number) => void
  hasError?: boolean
}

function CurrencyInput({ id, cents, onChange, hasError }: CurrencyInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault()
      const next = cents * 10 + parseInt(e.key)
      // Cap at R$ 99.999,99 to avoid unreasonable values
      if (next <= 9999999) onChange(next)
    } else if (e.key === "Backspace") {
      e.preventDefault()
      onChange(Math.floor(cents / 10))
    }
  }

  return (
    <Input
      id={id}
      inputMode="numeric"
      value={formatCents(cents)}
      onKeyDown={handleKeyDown}
      onChange={() => {
        // Controlled via onKeyDown — onChange is required by React but unused
      }}
      aria-invalid={hasError}
      className="tabular-nums"
    />
  )
}

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
  attendanceType: z.enum(["online", "presential"] as const),
  sessionsPerWeek: z.string().optional(),
  durationMinutes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ServicePlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: ServicePlanItem
}

export function ServicePlanFormDialog({ open, onOpenChange, plan }: ServicePlanFormDialogProps) {
  const isEdit = !!plan

  // Price is managed separately as integer cents for the bank-style input
  const [priceCents, setPriceCents] = useState<number>(0)
  const [priceError, setPriceError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      attendanceType: "online",
      sessionsPerWeek: "",
      durationMinutes: "",
    },
  })

  useEffect(() => {
    if (!open) return
    if (plan) {
      form.reset({
        name: plan.name,
        description: plan.description ?? "",
        attendanceType: plan.attendanceType,
        sessionsPerWeek: plan.sessionsPerWeek != null ? String(plan.sessionsPerWeek) : "",
        durationMinutes: plan.durationMinutes != null ? String(plan.durationMinutes) : "",
      })
      setPriceCents(priceToCents(plan.price))
    } else {
      form.reset({
        name: "",
        description: "",
        attendanceType: "online",
        sessionsPerWeek: "",
        durationMinutes: "",
      })
      setPriceCents(0)
    }
    setPriceError(null)
  }, [plan, form, open])

  const { data: attendanceTypes } = useEnumAttendanceTypes()
  const createPlan = useCreateServicePlan({ onOpenChange })
  const updatePlan = useUpdateServicePlan(plan?.id ?? "", { onOpenChange })

  function handleSubmit(values: FormValues) {
    if (priceCents <= 0) {
      setPriceError("Preço deve ser maior que zero")
      return
    }
    setPriceError(null)

    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: priceCents / 100,
      attendanceType: values.attendanceType,
      sessionsPerWeek: values.sessionsPerWeek ? Number(values.sessionsPerWeek) : undefined,
      durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : undefined,
    }

    if (isEdit) {
      updatePlan.mutate(payload)
    } else {
      createPlan.mutate(payload)
    }
  }

  const isPending = createPlan.isPending || updatePlan.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar plano" : "Novo plano de serviço"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="service-plan-form">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="plan-name">Nome</FieldLabel>
              <Input
                id="plan-name"
                placeholder="Ex: Consultoria Online, Personal Presencial..."
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="plan-description">Descrição</FieldLabel>
              <Textarea
                id="plan-description"
                placeholder="Descreva o que está incluso no plano..."
                rows={2}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="plan-price">Preço</FieldLabel>
              <CurrencyInput
                id="plan-price"
                cents={priceCents}
                onChange={(v) => {
                  setPriceCents(v)
                  if (v > 0) setPriceError(null)
                }}
                hasError={!!priceError}
              />
              {priceError && (
                <p className="text-sm text-destructive mt-1">{priceError}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="plan-attendanceType">Tipo de atendimento</FieldLabel>
              <Select
                value={form.watch("attendanceType")}
                onValueChange={(val) =>
                  form.setValue("attendanceType", val as "online" | "presential", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="plan-attendanceType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceTypes?.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.attendanceType]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="plan-sessionsPerWeek">Sessões por semana</FieldLabel>
                <Input
                  id="plan-sessionsPerWeek"
                  type="number"
                  min="1"
                  placeholder="Ex: 3"
                  {...form.register("sessionsPerWeek")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="plan-durationMinutes">Duração (min)</FieldLabel>
                <Input
                  id="plan-durationMinutes"
                  type="number"
                  min="1"
                  placeholder="Ex: 60"
                  {...form.register("durationMinutes")}
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
