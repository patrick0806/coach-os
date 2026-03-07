"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, CalendarDays, ChevronRight, Dumbbell, Plus, X } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
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
import { z.emailcomponents/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api-error";
import { deactivateStudent, getStudent, updateStudent } from "@/services/students.service";
import {
  assignStudentsToPlan,
  getStudentWorkoutPlans,
  listWorkoutPlans,
  revokeStudentFromPlan,
  type WorkoutPlan,
} from "@/services/workout-plans.service";

const editSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Informe um e-mail válido"),
});

type EditFormValues = z.infer<typeof editSchema>;

// ─── Student Workout Plans ─────────────────────────────────────────────────────

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
    queryKey: ["workout-plans", { page: 1, size: 100 }],
    queryFn: () => listWorkoutPlans({ page: 1, size: 100 }),
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
          <DialogTitle>Atribuir plano de treino</DialogTitle>
          <DialogDescription>
            Selecione um plano para atribuir a este aluno.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-gray-400">Carregando...</p>
        ) : available.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Todos os planos já foram atribuídos a este aluno.
          </p>
        ) : (
          <ul className="max-h-72 divide-y overflow-y-auto rounded-lg border">
            {available.map((plan) => (
              <li key={plan.id}>
                <button
                  type="button"
                  onClick={() => mutation.mutate(plan.id)}
                  disabled={mutation.isPending}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                    {plan.description ? (
                      <p className="text-xs text-gray-500 truncate">{plan.description}</p>
                    ) : null}
                  </div>
                  <Plus className="size-4 shrink-0 text-gray-400" />
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

interface StudentWorkoutPlansProps {
  studentId: string;
}

function StudentWorkoutPlans({ studentId }: StudentWorkoutPlansProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [assignOpen, setAssignOpen] = useState(false);
  const [revoking, setRevoking] = useState<WorkoutPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["student-workout-plans", studentId],
    queryFn: () => getStudentWorkoutPlans(studentId),
  });

  const revokeMutation = useMutation({
    mutationFn: (planId: string) => revokeStudentFromPlan(planId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-workout-plans", studentId] });
      toast.success("Plano removido do aluno.");
      setRevoking(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível remover o plano."));
    },
  });

  function handleAssigned() {
    queryClient.invalidateQueries({ queryKey: ["student-workout-plans", studentId] });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="size-4 text-gray-400" />
            Treinos atribuídos
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAssignOpen(true)}>
            <Plus className="size-3.5" />
            Atribuir
          </Button>
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
                    onClick={() => router.push(`/painel/treinos/${plan.id}`)}
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

// ─── Page ──────────────────────────────────────────────────────────────────────

interface AlunoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetailPage({ params }: AlunoDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudent(id),
  });

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (student) {
      form.reset({ name: student.name, email: student.email });
    }
  }, [student, form]);

  const updateMutation = useMutation({
    mutationFn: (values: EditFormValues) => updateStudent(id, values),
    onSuccess: (data) => {
      queryClient.setQueryData(["students", id], data);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Dados atualizados com sucesso.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o aluno."));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Aluno desativado.");
      router.push("/painel/alunos");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível desativar o aluno."));
      setDeactivateOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Aluno não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/painel/alunos")}>
          Voltar para alunos
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 gap-1.5 text-gray-500"
            onClick={() => router.push("/painel/alunos")}
          >
            <ArrowLeft className="size-4" />
            Alunos
          </Button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{student.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={student.isActive ? "default" : "secondary"}>
                {student.isActive ? "Ativo" : "Inativo"}
              </Badge>
              {student.isActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeactivateOpen(true)}
                >
                  Desativar aluno
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
                className="space-y-4"
                noValidate
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" {...form.register("name")} />
                    {form.formState.errors.name ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 text-sm text-gray-500 sm:grid-cols-2">
                  <div>
                    <span className="block font-medium text-gray-700">Cadastrado em</span>
                    {new Date(student.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div>
                    <span className="block font-medium text-gray-700">Última atualização</span>
                    {new Date(student.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Workouts */}
          <StudentWorkoutPlans studentId={id} />

          {/* Schedule — placeholder (US-014) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4 text-gray-400" />
                Próximos agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-sm text-muted-foreground">
                Os agendamentos deste aluno aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deactivate confirmation */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar <strong>{student.name}</strong>? O aluno perderá o
              acesso à plataforma, mas seus dados serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
