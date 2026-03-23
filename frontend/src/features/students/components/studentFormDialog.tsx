"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
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
import { useCreateStudent } from "@/features/students/hooks/useCreateStudent"
import { useUpdateStudent } from "@/features/students/hooks/useUpdateStudent"
import type { StudentDetail } from "@/features/students/types/students.types"
import { servicePlansService } from "@/features/servicePlans/services/servicePlans.service"
import { formatPhone } from "@/shared/utils/formatPhone"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  phoneNumber: z.string().optional(),
  goal: z.string().optional(),
  observations: z.string().optional(),
  physicalRestrictions: z.string().optional(),
  servicePlanId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: StudentDetail
}

export function StudentFormDialog({ open, onOpenChange, student }: StudentFormDialogProps) {
  const isEdit = !!student

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      goal: "",
      observations: "",
      physicalRestrictions: "",
      servicePlanId: "",
    },
  })

  // Fetch service plans only when creating a new student and dialog is open
  const { data: servicePlansResponse } = useQuery({
    queryKey: ["service-plans"],
    queryFn: () => servicePlansService.list(),
    enabled: open && !isEdit,
  })
  const activePlans = (servicePlansResponse ?? []).filter((p) => p.isActive)

  useEffect(() => {
    if (!open) return
    if (student) {
      form.reset({
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber ? formatPhone(student.phoneNumber) : "",
        goal: student.goal ?? "",
        observations: student.observations ?? "",
        physicalRestrictions: student.physicalRestrictions ?? "",
        servicePlanId: "",
      })
    } else {
      form.reset({
        name: "",
        email: "",
        phoneNumber: "",
        goal: "",
        observations: "",
        physicalRestrictions: "",
        servicePlanId: "",
      })
    }
  }, [student, form, open])

  const createStudent = useCreateStudent({ onOpenChange })
  const updateStudent = useUpdateStudent(student?.id ?? "", { onOpenChange })

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateStudent.mutate({
        name: values.name || undefined,
        phoneNumber: values.phoneNumber || null,
        goal: values.goal || null,
        observations: values.observations || null,
        physicalRestrictions: values.physicalRestrictions || null,
      })
    } else {
      if (!values.name || !values.email) return
      createStudent.mutate({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber || undefined,
        goal: values.goal || undefined,
        observations: values.observations || undefined,
        physicalRestrictions: values.physicalRestrictions || undefined,
        servicePlanId: values.servicePlanId || undefined,
      })
    }
  }

  const isPending = createStudent.isPending || updateStudent.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar aluno" : "Novo aluno"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                placeholder="Nome completo"
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
            {!isEdit && (
              <>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    {...form.register("email")}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>
                {activePlans.length > 0 && (
                  <Field>
                    <FieldLabel htmlFor="servicePlanId">Plano de serviço</FieldLabel>
                    <Select
                      value={form.watch("servicePlanId") ?? ""}
                      onValueChange={(val) => form.setValue("servicePlanId", val === "none" ? "" : val)}
                    >
                      <SelectTrigger id="servicePlanId">
                        <SelectValue placeholder="Selecionar plano (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {activePlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name} — R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </>
            )}
            <Field>
              <FieldLabel htmlFor="phoneNumber">Telefone</FieldLabel>
              <Input
                id="phoneNumber"
                placeholder="(11) 99999-9999"
                value={form.watch("phoneNumber") ?? ""}
                onChange={(e) => form.setValue("phoneNumber", formatPhone(e.target.value))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="goal">Objetivo</FieldLabel>
              <Input
                id="goal"
                placeholder="Ex: Perda de peso, hipertrofia..."
                {...form.register("goal")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="observations">Observações</FieldLabel>
              <Textarea
                id="observations"
                placeholder="Observações sobre o aluno..."
                rows={3}
                {...form.register("observations")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="physicalRestrictions">Restrições físicas</FieldLabel>
              <Textarea
                id="physicalRestrictions"
                placeholder="Ex: Dor no joelho, problema nas costas..."
                rows={3}
                {...form.register("physicalRestrictions")}
              />
            </Field>
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
