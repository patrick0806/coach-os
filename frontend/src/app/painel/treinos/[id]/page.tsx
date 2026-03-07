"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getWorkoutPlan, reorderExercises } from "@/services/workout-plans.service";
import { AddExerciseDialog } from "./_components/add-exercise-dialog";
import { DeletePlanDialog } from "./_components/delete-plan-dialog";
import { EditPlanDialog } from "./_components/edit-plan-dialog";
import { ExerciseRow } from "./_components/exercise-row";

interface TreinoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TreinoDetailPage({ params }: TreinoDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["workout-plan", id],
    queryFn: () => getWorkoutPlan(id),
  });

  async function handleReorder(exerciseId: string, direction: "up" | "down") {
    if (!plan) return;

    const sorted = [...plan.exercises].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((e) => e.id === exerciseId);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const items = sorted.map((e, i) => {
      if (i === idx) return { id: e.id, order: sorted[targetIdx].order };
      if (i === targetIdx) return { id: e.id, order: sorted[idx].order };
      return { id: e.id, order: e.order };
    });

    // Optimistic update
    queryClient.setQueryData(["workout-plan", id], {
      ...plan,
      exercises: plan.exercises.map((e) => {
        const found = items.find((it) => it.id === e.id);
        return found ? { ...e, order: found.order } : e;
      }),
    });

    try {
      await reorderExercises(id, items);
    } catch {
      queryClient.invalidateQueries({ queryKey: ["workout-plan", id] });
      toast.error("Não foi possível reordenar os exercícios.");
    }
  }

  function handleExerciseMutated() {
    queryClient.invalidateQueries({ queryKey: ["workout-plan", id] });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Plano não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/painel/treinos")}>
          Voltar para treinos
        </Button>
      </div>
    );
  }

  const sortedExercises = [...plan.exercises].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 gap-1.5 text-gray-500"
          onClick={() => router.push("/painel/treinos")}
        >
          <ArrowLeft className="size-4" />
          Treinos
        </Button>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">{plan.name}</h1>
            {plan.description ? (
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">
              Exercícios{" "}
              <span className="ml-1 text-sm font-normal text-gray-400">
                ({sortedExercises.length})
              </span>
            </CardTitle>
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Adicionar
            </Button>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            {sortedExercises.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center text-gray-400">
                <p className="text-sm">Nenhum exercício neste plano.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setAddOpen(true)}
                >
                  Adicionar exercício
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedExercises.map((ex, idx) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    isFirst={idx === 0}
                    isLast={idx === sortedExercises.length - 1}
                    planId={id}
                    onReorder={handleReorder}
                    onRemoved={handleExerciseMutated}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditPlanDialog
        planId={id}
        plan={plan}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AddExerciseDialog
        open={addOpen}
        planId={id}
        currentCount={sortedExercises.length}
        onOpenChange={setAddOpen}
        onAdded={handleExerciseMutated}
      />

      <DeletePlanDialog
        planId={id}
        planName={plan.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/painel/treinos")}
      />
    </>
  );
}
