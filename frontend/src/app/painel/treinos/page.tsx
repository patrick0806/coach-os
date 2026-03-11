"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listWorkoutPlans } from "@/services/workout-plans.service";
import { CreatePlanDialog } from "./_components/create-plan-dialog";
import { PlansList } from "./_components/plans-list";

const PAGE_SIZE = 10;

export default function TreinosPage() {
  const router = useRouter();
  const shouldStartCreateOpen =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("action") === "new-plan";
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(shouldStartCreateOpen);

  const { data, isLoading } = useQuery({
    queryKey: ["workout-plans", { page, kind: "template" }],
    queryFn: () => listWorkoutPlans({ page, size: PAGE_SIZE, kind: "template" }),
  });

  const plans = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--premium-border)] bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Biblioteca de treino
          </span>
          <h1 className="premium-heading text-3xl">Modelos de Treino</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie modelos reutilizáveis e aplique aos seus alunos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} variant="premium" className="gap-2">
          <Plus className="size-4" />
          Novo modelo
        </Button>
      </div>

      <PlansList
        plans={plans}
        isLoading={isLoading}
        onCreateClick={() => setCreateOpen(true)}
        emptyMessage="Você ainda não tem modelos de treino."
      />

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {totalPages} — {data?.totalElements ?? 0} modelos
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

      <CreatePlanDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => router.push(`/painel/treinos/${id}`)}
      />
    </div>
  );
}
