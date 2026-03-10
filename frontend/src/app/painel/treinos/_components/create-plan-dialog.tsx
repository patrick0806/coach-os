"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { listStudents } from "@/services/students.service";
import { assignStudentsToPlan, createWorkoutPlan } from "@/services/workout-plans.service";

const createPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  planKind: z.enum(["template", "student"]),
  studentId: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.planKind === "student" && !values.studentId) {
    ctx.addIssue({
      code: "custom",
      path: ["studentId"],
      message: "Selecione um aluno para o treino específico",
    });
  }
});

type CreatePlanValues = z.infer<typeof createPlanSchema>;

interface CreatePlanDialogProps {
  open: boolean;
  defaultPlanKind?: "template" | "student";
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

export function CreatePlanDialog({
  open,
  defaultPlanKind = "template",
  onOpenChange,
  onCreated,
}: CreatePlanDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreatePlanValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: "", description: "", planKind: defaultPlanKind, studentId: "" },
  });

  const selectedPlanKind = form.watch("planKind");

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", "create-student-plan"],
    queryFn: () => listStudents({ page: 1, size: 200 }),
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
        planKind: defaultPlanKind,
        studentId: "",
      });
    }
  }, [defaultPlanKind, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: CreatePlanValues) => {
      const created = await createWorkoutPlan({
        name: values.name,
        description: values.description || undefined,
        planKind: values.planKind,
      });

      if (values.planKind === "student" && values.studentId) {
        await assignStudentsToPlan(created.id, [values.studentId]);
      }

      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Plano de treino criado.");
      onOpenChange(false);
      form.reset({ name: "", description: "", planKind: defaultPlanKind, studentId: "" });
      onCreated(created.id);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o plano."));
    },
  });

  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset({ name: "", description: "", planKind: defaultPlanKind, studentId: "" });
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo plano de treino</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
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

          <div className="space-y-2">
            <Label htmlFor="plan-kind">Tipo</Label>
            <select
              id="plan-kind"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("planKind")}
            >
              <option value="template">Modelo</option>
              <option value="student">Específico por aluno</option>
            </select>
          </div>

          {selectedPlanKind === "student" ? (
            <div className="space-y-2">
              <Label htmlFor="plan-student">Aluno</Label>
              <select
                id="plan-student"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isLoadingStudents}
                {...form.register("studentId")}
              >
                <option value="">Selecione um aluno</option>
                {(studentsData?.content ?? []).map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.studentId ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.studentId.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Criando..." : "Criar plano"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
