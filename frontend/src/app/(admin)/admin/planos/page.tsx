"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/features/admin/hooks/useAdminPlans";
import type { AdminPlan } from "@/features/admin/types/admin.types";

// Formats an integer (cents) as BRL currency string
function formatCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

// Converts a decimal price string (e.g. "29.90") to integer cents
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

  const [name, setName] = useState(plan?.name ?? "");
  const [priceCents, setPriceCents] = useState(plan?.price ? priceToCents(plan.price) : 0);
  const [maxStudents, setMaxStudents] = useState(String(plan?.maxStudents ?? ""));
  const [order, setOrder] = useState(String(plan?.order ?? "0"));
  const [error, setError] = useState("");

  const isEdit = !!plan;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const price = (priceCents / 100).toFixed(2);
      if (isEdit) {
        await updatePlan.mutateAsync({
          id: plan.id,
          data: {
            name,
            price,
            maxStudents: parseInt(maxStudents),
            order: parseInt(order),
          },
        });
      } else {
        await createPlan.mutateAsync({
          name,
          price,
          maxStudents: parseInt(maxStudents),
          order: parseInt(order),
        });
      }
      onClose();
    } catch {
      setError("Erro ao salvar plano. Verifique os dados.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Plano" : "Novo Plano"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <CurrencyInput
              id="price"
              cents={priceCents}
              onChange={setPriceCents}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">Limite de Alunos</Label>
            <Input
              id="maxStudents"
              type="number"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.order ?? "—"}</TableCell>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{formatCents(priceToCents(plan.price))}</TableCell>
                <TableCell>{plan.maxStudents} alunos</TableCell>
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

      <PlanFormDialog key={editingPlan?.id ?? "new"} open={dialogOpen} onClose={handleClose} plan={editingPlan} />
    </div>
  );
}
