"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ChevronRight, Dumbbell, Plus, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  assignStudentsToPlan,
  getStudentWorkoutPlans,
  listWorkoutPlans,
  revokeStudentFromPlan,
  createStudentWorkoutPlan,
  type WorkoutPlan,
} from "@/services/workout-plans.service";

// ─── Create Specific Plan Dialog ───────────────────────────────────────────────

const createSpecificPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type CreateSpecificPlanValues = z.infer<typeof createSpecificPlanSchema>;

interface CreateStudentPlanDialogProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateStudentPlanDialog({ studentId, open, onOpenChange }: CreateStudentPlanDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateSpecificPlanValues>({
    resolver: zodResolver(createSpecificPlanSchema),
    defaultValues: { name: "", description: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateSpecificPlanValues) =>
      createStudentWorkoutPlan(studentId, {
        name: values.name,
        description: values.description || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["student-workout-plans", studentId] });
      toast.success("Treino específico criado.");
      onOpenChange(false);
      form.reset({ name: "", description: "" });
      router.push(`/painel/treinos/${created.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o treino."));
    },
  });

  function handleOpenChange(open: boolean) {
    if (!open) form.reset({ name: "", description: "" });
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar treino específico</DialogTitle>
          <DialogDescription>
            Este treino será vinculado apenas a este aluno e não aparecerá na sua lista de modelos gerais.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="plan-name">Nome do Treino</Label>
            <Input id="plan-name" placeholder="Ex: Ficha Adaptação" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-desc">Descrição (opcional)</Label>
            <Textarea id="plan-desc" rows={3} {...form.register("description")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Criando..." : "Criar treino"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Plan Dialog ────────────────────────────────────────────────────────

interface AssignPlanDialogProps {
  studentId: string;
  assignedIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

function AssignPlanDialog({
  studentId,
  assignedIds,
  open,
  onOpenChange,
  onAssigned,
}: AssignPlanDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["workout-plans", { page: 1, size: 100, kind: "template" }],
    queryFn: () => listWorkoutPlans({ page: 1, size: 100, kind: "template" }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (planId: string) => assignStudentsToPlan(planId, [studentId]),
    onSuccess: () => {
      toast.success("Plano atribuído ao aluno.");
      onAssigned();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atribuir o plano."));
    },
  });

  const available = (data?.content ?? []).filter((p) => !assignedIds.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir modelo de treino</DialogTitle>
          <DialogDescription>
            Atribua um dos seus modelos gerais a este aluno.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Carregando...</p>
        ) : available.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Você não tem modelos disponíveis.
          </p>
        ) : (
          <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
            {available.map((plan) => (
              <li key={plan.id}>
                <button
                  type="button"
                  onClick={() => mutation.mutate(plan.id)}
                  disabled={mutation.isPending}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{plan.name}</p>
                    {plan.description && (
                      <p className="truncate text-xs text-muted-foreground">{plan.description}</p>
                    )}
                  </div>
                  <Plus className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Student Workout Plans ─────────────────────────────────────────────────────

interface StudentWorkoutPlansProps {
  studentId: string;
}

export function StudentWorkoutPlans({ studentId }: StudentWorkoutPlansProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [assignOpen, setAssignOpen] = useState(false);
  const [createSpecificOpen, setCreateSpecificOpen] = useState(false);
  const [revoking, setRevoking] = useState<WorkoutPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["student-workout-plans", studentId],
    queryFn: () => getStudentWorkoutPlans(studentId),
  });

  const revokeMutation = useMutation({
    mutationFn: (planId: string) => revokeStudentFromPlan(planId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-workout-plans", studentId] });
      toast.success("Treino removido do aluno.");
      setRevoking(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível remover o treino."));
    },
  });

  function handleAssigned() {
    queryClient.invalidateQueries({ queryKey: ["student-workout-plans", studentId] });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="size-4 text-muted-foreground" />
            Treinos
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setAssignOpen(true)}
            >
              Atribuir modelo
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateSpecificOpen(true)}
            >
              <Plus className="size-3.5" />
              Criar treino específico
            </Button>
          </div>
        </CardHeader>
        <CardContent className={plans.length > 0 ? "p-0" : undefined}>
          {isLoading ? (
            <p className="pb-4 text-center text-sm text-gray-400">Carregando...</p>
          ) : plans.length === 0 ? (
            <p className="pb-4 text-sm text-muted-foreground">
              Nenhum plano de treino atribuído a este aluno.
            </p>
          ) : (
            <ul className="divide-y">
              {plans.map((plan) => (
                <li key={plan.id} className="flex items-center justify-between px-6 py-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/painel/treinos/${plan.id}?studentId=${studentId}`)}
                    className="flex flex-1 items-center gap-2 text-left hover:underline"
                  >
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                    <ChevronRight className="size-4 text-gray-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevoking(plan)}
                    className="ml-2 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AssignPlanDialog
        studentId={studentId}
        assignedIds={plans.map((p) => p.id)}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssigned={handleAssigned}
      />

      <CreateStudentPlanDialog
        studentId={studentId}
        open={createSpecificOpen}
        onOpenChange={setCreateSpecificOpen}
      />

      <AlertDialog open={Boolean(revoking)} onOpenChange={(open) => !open && setRevoking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover plano do aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o plano <strong>{revoking?.name}</strong> deste aluno?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => revoking && revokeMutation.mutate(revoking.id)}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
