"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { listWorkoutPlans } from "@/services/workout-plans.service";
import { CreatePlanDialog } from "./_components/create-plan-dialog";
import { PlansList } from "./_components/plans-list";

const PAGE_SIZE = 10;

export default function TreinosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["workout-plans", { page }],
    queryFn: () => listWorkoutPlans({ page, size: PAGE_SIZE }),
  });

  const plans = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
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

      <PlansList plans={plans} isLoading={isLoading} onCreateClick={() => setCreateOpen(true)} />

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

      <CreatePlanDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => router.push(`/painel/treinos/${id}`)}
      />
    </div>
  );
}
