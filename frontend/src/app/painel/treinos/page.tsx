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
type PlanTab = "template" | "student";

export default function TreinosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<PlanTab>("template");
  const [createOpen, setCreateOpen] = useState(false);
  const [studentFilter, setStudentFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["workout-plans", { page, kind: activeTab }],
    queryFn: () => listWorkoutPlans({ page, size: PAGE_SIZE, kind: activeTab }),
  });

  const plans = data?.content ?? [];
  const filteredPlans =
    activeTab === "student" && studentFilter.trim()
      ? plans.filter((plan) =>
          plan.studentNames.join(" ").toLowerCase().includes(studentFilter.trim().toLowerCase()),
        )
      : plans;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Treinos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize seus modelos e treinos específicos por aluno.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Novo plano
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={activeTab === "template" ? "default" : "outline"}
          onClick={() => {
            setActiveTab("template");
            setPage(1);
          }}
        >
          Modelos
        </Button>
        <Button
          variant={activeTab === "student" ? "default" : "outline"}
          onClick={() => {
            setActiveTab("student");
            setPage(1);
          }}
        >
          Por aluno
        </Button>
      </div>

      {activeTab === "student" ? (
        <div className="mb-4">
          <input
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            placeholder="Filtrar por nome do aluno"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      ) : null}

      <PlansList
        plans={filteredPlans}
        isLoading={isLoading}
        onCreateClick={() => setCreateOpen(true)}
        emptyMessage={
          activeTab === "template"
            ? "Você ainda não tem modelos de treino."
            : "Você ainda não tem treinos específicos por aluno."
        }
        showApplyAction={activeTab === "template"}
      />

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
        defaultPlanKind={activeTab}
        onOpenChange={setCreateOpen}
        onCreated={(id) => router.push(`/painel/treinos/${id}`)}
      />
    </div>
  );
}
