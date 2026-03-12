"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Wifi, Home, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createServicePlan,
  updateServicePlan,
  type ServicePlan,
} from "@/services/service-plans.service";

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  const cents = Number(digits || "0") / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents);
}

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  return Number(digits || "0") / 100;
}

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sessionsPerWeek: z.coerce.number().int().min(1).max(7),
  durationMinutes: z.coerce.number().int().min(1),
  price: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine((value) => parseCurrencyInput(value) >= 0, "Preço é obrigatório"),
  attendanceType: z.enum(["online", "presential", "residential"]).default("presential"),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface ServicePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: ServicePlan;
}

export function ServicePlanDialog({ open, onOpenChange, plan }: ServicePlanDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(plan);

  const form = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      sessionsPerWeek: 3,
      durationMinutes: 60,
      price: formatCurrencyInput(""),
      attendanceType: "presential" as const,
    },
  });
  const priceValue = useWatch({ control: form.control, name: "price" }) ?? formatCurrencyInput("");

  useEffect(() => {
    if (open) {
      form.reset(
        plan
          ? {
              name: plan.name,
              description: plan.description ?? "",
              sessionsPerWeek: plan.sessionsPerWeek,
              durationMinutes: plan.durationMinutes,
              price: formatCurrencyInput(plan.price),
              attendanceType: plan.attendanceType ?? "presential",
            }
          : {
              name: "",
              description: "",
              sessionsPerWeek: 3,
              durationMinutes: 60,
              price: formatCurrencyInput(""),
              attendanceType: "presential" as const,
            },
      );
    }
  }, [open, plan, form]);

  const mutation = useMutation({
    mutationFn: (values: FormOutput) =>
      isEditing
        ? updateServicePlan(plan!.id, {
            name: values.name,
            description: values.description || undefined,
            sessionsPerWeek: values.sessionsPerWeek,
            durationMinutes: values.durationMinutes,
            price: parseCurrencyInput(values.price),
            attendanceType: values.attendanceType,
          })
        : createServicePlan({
            name: values.name,
            description: values.description || undefined,
            sessionsPerWeek: values.sessionsPerWeek,
            durationMinutes: values.durationMinutes,
            price: parseCurrencyInput(values.price),
            attendanceType: values.attendanceType,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-plans"] });
      toast.success(isEditing ? "Plano atualizado." : "Plano criado.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar o plano."));
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar plano" : "Novo plano de serviço"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="sp-name">Nome</Label>
            <Input id="sp-name" placeholder="Ex: Plano 3x/semana" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sp-desc">Descrição (opcional)</Label>
            <Textarea
              id="sp-desc"
              placeholder="Detalhes do plano..."
              rows={2}
              {...form.register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sp-sessions">Sessões/semana</Label>
              <Input
                id="sp-sessions"
                type="number"
                min={1}
                max={7}
                {...form.register("sessionsPerWeek")}
              />
              {form.formState.errors.sessionsPerWeek ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.sessionsPerWeek.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-duration">Duração (min)</Label>
              <Input
                id="sp-duration"
                type="number"
                min={1}
                {...form.register("durationMinutes")}
              />
              {form.formState.errors.durationMinutes ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.durationMinutes.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de atendimento</Label>
            <Select
              value={form.watch("attendanceType")}
              onValueChange={(value) =>
                form.setValue(
                  "attendanceType",
                  value as "online" | "presential" | "residential",
                  { shouldDirty: true },
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presential">
                  <span className="flex items-center gap-2">
                    <Users className="size-4" />
                    Presencial
                  </span>
                </SelectItem>
                <SelectItem value="online">
                  <span className="flex items-center gap-2">
                    <Wifi className="size-4" />
                    Online
                  </span>
                </SelectItem>
                <SelectItem value="residential">
                  <span className="flex items-center gap-2">
                    <Home className="size-4" />
                    Residencial
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sp-price">Preço mensal (R$)</Label>
            <Input
              id="sp-price"
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={priceValue}
              onChange={(event) =>
                form.setValue("price", formatCurrencyInput(event.target.value), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            {form.formState.errors.price ? (
              <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
