"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CopyPlus, Dumbbell, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { listStudents } from "@/services/students.service";
import { applyWorkoutTemplate, type WorkoutPlan } from "@/services/workout-plans.service";

interface ApplyTemplateDialogProps {
  plan: WorkoutPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ApplyTemplateDialog({ plan, open, onOpenChange }: ApplyTemplateDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState<string>("none");

  const { data, isLoading } = useQuery({
    queryKey: ["students", "apply-template"],
    queryFn: () => listStudents({ page: 1, size: 200 }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      applyWorkoutTemplate(plan!.id, {
        studentId: studentId !== "none" ? studentId : undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Modelo aplicado com sucesso.");
      onOpenChange(false);
      setStudentId("none");
      router.push(`/painel/treinos/${created.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível aplicar o modelo."));
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setStudentId("none");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aplicar modelo ao aluno</DialogTitle>
          <DialogDescription>
            Será criada uma cópia editável de <strong>{plan?.name ?? "modelo"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Aluno (opcional)</label>
          <Select value={studentId} onValueChange={setStudentId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um aluno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Atribuir depois</SelectItem>
              {(data?.content ?? []).map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Se não selecionar um aluno agora, você pode atribuir depois.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !plan}>
            {mutation.isPending ? "Aplicando..." : "Aplicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PlansListProps {
  plans: WorkoutPlan[];
  isLoading: boolean;
  onCreateClick: () => void;
  emptyMessage?: string;
}

export function PlansList({
  plans,
  isLoading,
  onCreateClick,
  emptyMessage = "Você ainda não tem modelos de treino.",
}: PlansListProps) {
  const router = useRouter();
  const [applyPlan, setApplyPlan] = useState<WorkoutPlan | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <Dumbbell className="mb-3 size-10 opacity-30" />
          <p>{emptyMessage}</p>
          <Button variant="outline" className="mt-4" onClick={onCreateClick}>
            Criar primeiro modelo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="premium-surface flex items-center justify-between rounded-3xl p-4"
        >
          <button
            onClick={() => router.push(`/painel/treinos/${plan.id}`)}
            className="flex min-w-0 flex-1 items-center justify-between text-left transition-colors hover:text-primary"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{plan.name}</p>
              </div>
              {plan.description ? (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{plan.description}</p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}</span>
                {plan.studentNames.length > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {plan.studentNames.join(", ")}
                  </span>
                ) : null}
              </div>
            </div>
            <ChevronRight className="ml-4 size-5 shrink-0 text-muted-foreground" />
          </button>

          <Button
            variant="premium-ghost"
            size="sm"
            className="ml-4 gap-1.5"
            onClick={() => setApplyPlan(plan)}
          >
            <CopyPlus className="size-3.5" />
            Aplicar
          </Button>
        </div>
      ))}

      <ApplyTemplateDialog
        plan={applyPlan}
        open={Boolean(applyPlan)}
        onOpenChange={(open) => !open && setApplyPlan(null)}
      />
    </div>
  );
}
