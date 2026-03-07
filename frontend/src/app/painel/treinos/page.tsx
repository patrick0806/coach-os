"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronRight, Dumbbell, Plus } from "lucide-react";

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
import { createWorkoutPlan, listWorkoutPlans } from "@/services/workout-plans.service";

const createPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type CreatePlanValues = z.infer<typeof createPlanSchema>;

const PAGE_SIZE = 10;

export default function TreinosPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["workout-plans", { page }],
    queryFn: () => listWorkoutPlans({ page, size: PAGE_SIZE }),
  });

  const form = useForm<CreatePlanValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: "", description: "" },
  });

  const createMutation = useMutation({
    mutationFn: createWorkoutPlan,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Plano de treino criado.");
      setCreateOpen(false);
      form.reset();
      router.push(`/painel/treinos/${created.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o plano."));
    },
  });

  function handleOpenChange(open: boolean) {
    if (!open) form.reset();
    setCreateOpen(open);
  }

  const plans = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Treinos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crie e gerencie os planos de treino dos seus alunos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Novo plano
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center text-gray-400">
            <Dumbbell className="mb-3 size-10 opacity-30" />
            <p>Você ainda não tem planos de treino.</p>
            <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
              Criar primeiro plano
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => router.push(`/painel/treinos/${plan.id}`)}
              className="flex w-full items-center justify-between rounded-xl border bg-white p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{plan.name}</p>
                {plan.description ? (
                  <p className="mt-0.5 truncate text-sm text-gray-500">{plan.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-gray-400">
                  Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <ChevronRight className="ml-4 size-5 shrink-0 text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {page} de {totalPages} — {data?.totalElements ?? 0} planos
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo plano de treino</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) =>
              createMutation.mutate({
                name: values.name,
                description: values.description || undefined,
              }),
            )}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nome</Label>
              <Input
                id="plan-name"
                placeholder="Treino A — Peito e Tríceps"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-desc">Descrição (opcional)</Label>
              <Textarea
                id="plan-desc"
                placeholder="Foco em membros superiores..."
                rows={3}
                {...form.register("description")}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar plano"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
