"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import { PageHeader } from "@/shared/components/pageHeader";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/features/admin/hooks/useAdminPlans";
import type { AdminPlan } from "@/features/admin/types/admin.types";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function priceToCents(price: string): number {
  return Math.round(parseFloat(price) * 100);
}

interface CurrencyInputProps {
  id?: string;
  cents: number;
  onChange: (cents: number) => void;
}

function CurrencyInput({ id, cents, onChange }: CurrencyInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const next = cents * 10 + parseInt(e.key);
      if (next <= 9999999) onChange(next);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      onChange(Math.floor(cents / 10));
    }
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={formatCents(cents)}
      onKeyDown={handleKeyDown}
      onChange={() => {}}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  );
}

function getDefaultFormState(plan?: AdminPlan | null) {
  return {
    name: plan?.name ?? "",
    priceCents: plan?.price ? priceToCents(plan.price) : 0,
    maxStudents: String(plan?.maxStudents ?? ""),
    order: String(plan?.order ?? "0"),
    stripePriceId: plan?.stripePriceId ?? "",
    description: plan?.description ?? "",
    highlighted: plan?.highlighted ?? false,
    isActive: plan?.isActive ?? true,
    isDefault: plan?.isDefault ?? false,
    benefits: plan?.benefits ?? [],
  };
}

function PlanFormDialog({
  open,
  onClose,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  plan?: AdminPlan | null;
}) {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const [form, setForm] = useState(() => getDefaultFormState(plan));
  const [newBenefit, setNewBenefit] = useState("");
  const [error, setError] = useState("");

  const isEdit = !!plan;

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addBenefit() {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;
    updateField("benefits", [...form.benefits, trimmed]);
    setNewBenefit("");
  }

  function removeBenefit(index: number) {
    updateField("benefits", form.benefits.filter((_, i) => i !== index));
  }

  function handleBenefitKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addBenefit();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const price = (form.priceCents / 100).toFixed(2);
      const payload = {
        name: form.name,
        price,
        maxStudents: parseInt(form.maxStudents),
        order: parseInt(form.order),
        description: form.description || undefined,
        highlighted: form.highlighted,
        benefits: form.benefits.length > 0 ? form.benefits : undefined,
        stripePriceId: form.stripePriceId || undefined,
      };

      if (isEdit) {
        await updatePlan.mutateAsync({
          id: plan.id,
          data: {
            ...payload,
            description: form.description || null,
            stripePriceId: form.stripePriceId || null,
            isActive: form.isActive,
          },
        });
      } else {
        await createPlan.mutateAsync(payload);
      }
      onClose();
    } catch {
      setError("Erro ao salvar plano. Verifique os dados.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Plano" : "Novo Plano"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Descrição do plano..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <CurrencyInput
                id="price"
                cents={form.priceCents}
                onChange={(v) => updateField("priceCents", v)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Limite de Alunos</Label>
              <Input
                id="maxStudents"
                type="number"
                value={form.maxStudents}
                onChange={(e) => updateField("maxStudents", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => updateField("order", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripePriceId">Stripe Price ID</Label>
              <Input
                id="stripePriceId"
                value={form.stripePriceId}
                onChange={(e) => updateField("stripePriceId", e.target.value)}
                placeholder="price_1Abc..."
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="highlighted"
                checked={form.highlighted}
                onCheckedChange={(v) => updateField("highlighted", v === true)}
              />
              <Label htmlFor="highlighted" className="cursor-pointer">
                Plano em destaque
              </Label>
            </div>

            {isEdit && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) => updateField("isActive", v === true)}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Ativo
                </Label>
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label>Benefícios</Label>
            <div className="flex gap-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={handleBenefitKeyDown}
                placeholder="Adicionar benefício..."
              />
              <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                <Plus className="size-4" />
              </Button>
            </div>
            {form.benefits.length > 0 && (
              <ul className="space-y-1">
                {form.benefits.map((benefit, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
                  >
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createPlan.isPending || updatePlan.isPending}
            >
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPlanosPage() {
  const { data: plans, isLoading } = useAdminPlans();
  const deletePlan = useDeletePlan();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);

  function handleCreate() {
    setEditingPlan(null);
    setDialogOpen(true);
  }

  function handleEdit(plan: AdminPlan) {
    setEditingPlan(plan);
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditingPlan(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos"
        description="Gerencie os planos da plataforma."
        actions={
          <Button onClick={handleCreate} size="sm">
            <Plus className="size-4 mr-2" />
            Novo Plano
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !plans?.length ? (
        <p className="text-muted-foreground">Nenhum plano encontrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Limite</TableHead>
              <TableHead>Stripe Price ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.order ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{plan.name}</span>
                    {plan.highlighted && (
                      <Badge variant="outline" className="text-xs">
                        Destaque
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatCents(priceToCents(plan.price))}</TableCell>
                <TableCell>{plan.maxStudents} alunos</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {plan.stripePriceId ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(plan)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-destructive"
                      onClick={() => deletePlan.mutate(plan.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PlanFormDialog key={`${dialogOpen}-${editingPlan?.id ?? "new"}`} open={dialogOpen} onClose={handleClose} plan={editingPlan} />
    </div>
  );
}
