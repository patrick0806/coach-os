"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ClipboardList, Pencil, Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createAdminPlan,
  listAdminPlans,
  reorderAdminPlans,
  toggleAdminPlanStatus,
  updateAdminPlan,
  type AdminPlan,
} from "@/services/admin.service";

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  const cents = Number(digits || "0") / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents);
}

function parseCurrencyToDecimalString(value: string): string {
  const digits = value.replace(/\D/g, "");
  const cents = Number(digits || "0");
  return (cents / 100).toFixed(2);
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.string().min(1, "Preço obrigatório"),
  maxStudents: z.coerce.number().int().min(-1),
  benefits: z.string().min(1, "Ao menos um benefício"),
  highlighted: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanDialogProps {
  plan?: AdminPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PlanDialog({ plan, open, onOpenChange }: PlanDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(plan);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price: formatCurrencyInput(""),
      maxStudents: 10,
      benefits: "",
      highlighted: false,
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
              price: formatCurrencyInput(plan.price),
              maxStudents: plan.maxStudents,
              benefits: plan.benefits.join("\n"),
              highlighted: plan.highlighted,
            }
          : {
              name: "",
              description: "",
              price: formatCurrencyInput(""),
              maxStudents: 10,
              benefits: "",
              highlighted: false,
            },
      );
    }
  }, [open, plan, form]);

  const mutation = useMutation({
    mutationFn: (values: PlanFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        price: parseCurrencyToDecimalString(values.price),
        maxStudents: values.maxStudents,
        benefits: values.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
        highlighted: values.highlighted,
      };
      return isEditing ? updateAdminPlan(plan!.id, payload) : createAdminPlan(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
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
          <DialogTitle>{isEditing ? "Editar plano" : "Novo plano SaaS"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Nome</Label>
              <Input id="p-name" placeholder="Pro" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-price">Preço (R$)</Label>
              <Input
                id="p-price"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-max">Limite de alunos (-1 = ilimitado)</Label>
              <Input id="p-max" type="number" min={-1} {...form.register("maxStudents")} />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <input
                type="checkbox"
                id="p-highlighted"
                {...form.register("highlighted")}
                className="size-4"
              />
              <Label htmlFor="p-highlighted" className="flex items-center gap-1.5 cursor-pointer">
                <Star className="size-3.5 text-yellow-400" />
                Destaque
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-desc">Descrição (opcional)</Label>
            <Input id="p-desc" {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-benefits">Benefícios (um por linha)</Label>
            <Textarea
              id="p-benefits"
              rows={4}
              placeholder={"Até 10 alunos\nSuportte prioritário\nRelátórios avançados"}
              {...form.register("benefits")}
            />
            {form.formState.errors.benefits ? (
              <p className="text-sm text-destructive">{form.formState.errors.benefits.message}</p>
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

// ─── Plan row ─────────────────────────────────────────────────────────────────

interface PlanRowProps {
  plan: AdminPlan;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onReorder: (direction: "up" | "down") => void;
  onToggle: () => void;
  isToggling: boolean;
}

function PlanRow({ plan, isFirst, isLast, onEdit, onReorder, onToggle, isToggling }: PlanRowProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 transition-opacity ${
        !plan.isActive ? "opacity-50" : ""
      } bg-card border-border`}
    >
      {/* Reorder */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onReorder("up")}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={() => onReorder("down")}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">{plan.name}</span>
          {plan.highlighted ? (
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          ) : null}
          {!plan.isActive ? (
            <Badge variant="secondary" className="text-xs">Inativo</Badge>
          ) : null}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>
            {parseFloat(plan.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês
          </span>
          <span>·</span>
          <span>
            {plan.maxStudents === -1 || plan.maxStudents === 0 ? "ilimitados" : plan.maxStudents} alunos
          </span>
          <span>·</span>
          <span>{plan.benefits.length} benefícios</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onEdit}>
          <Pencil className="size-3.5" />
          Editar
        </Button>
        <button
          type="button"
          onClick={onToggle}
          disabled={isToggling}
          aria-label={plan.isActive ? "Desativar" : "Ativar"}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
            plan.isActive ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
              plan.isActive ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const [dialogPlan, setDialogPlan] = useState<AdminPlan | null | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: listAdminPlans,
  });

  const sorted = [...plans].sort((a, b) => a.order - b.order);

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => reorderAdminPlans(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-plans"] }),
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.error("Não foi possível reordenar os planos.");
    },
  });

  async function handleReorder(planId: string, direction: "up" | "down") {
    const idx = sorted.findIndex((p) => p.id === planId);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const items = sorted.map((p, i) => {
      if (i === idx) return { id: p.id, order: sorted[targetIdx].order };
      if (i === targetIdx) return { id: p.id, order: sorted[idx].order };
      return { id: p.id, order: p.order };
    });

    // Optimistic update
    queryClient.setQueryData(["admin-plans"], (old: AdminPlan[] | undefined) =>
      (old ?? []).map((p) => {
        const found = items.find((it) => it.id === p.id);
        return found ? { ...p, order: found.order } : p;
      }),
    );

    reorderMutation.mutate(items);
  }

  async function handleToggle(plan: AdminPlan) {
    setTogglingId(plan.id);
    try {
      await toggleAdminPlanStatus(plan.id, !plan.isActive);
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(plan.isActive ? "Plano desativado." : "Plano ativado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível alterar o status."));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="p-4 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Planos SaaS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerencie os planos de assinatura da plataforma.
            </p>
          </div>
          <Button onClick={() => setDialogPlan(null)} className="gap-2">
            <Plus className="size-4" />
            Novo plano
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-accent" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
              <ClipboardList className="mb-3 size-10 opacity-30" />
              <p>Nenhum plano cadastrado.</p>
              <Button variant="outline" className="mt-4" onClick={() => setDialogPlan(null)}>
                Criar primeiro plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map((plan, idx) => (
              <PlanRow
                key={plan.id}
                plan={plan}
                isFirst={idx === 0}
                isLast={idx === sorted.length - 1}
                onEdit={() => setDialogPlan(plan)}
                onReorder={(dir) => handleReorder(plan.id, dir)}
                onToggle={() => handleToggle(plan)}
                isToggling={togglingId === plan.id}
              />
            ))}
          </div>
        )}
      </div>

      <PlanDialog
        open={dialogPlan !== undefined}
        onOpenChange={(open) => !open && setDialogPlan(undefined)}
        plan={dialogPlan ?? undefined}
      />
    </>
  );
}
