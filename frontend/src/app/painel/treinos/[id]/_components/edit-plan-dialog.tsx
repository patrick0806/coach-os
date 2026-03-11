"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { updateWorkoutPlan } from "@/services/workout-plans.service";
import { TemplateEditDecisionDialog } from "./template-edit-decision-dialog";

const editPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type EditPlanValues = z.infer<typeof editPlanSchema>;

interface EditPlanDialogProps {
  planId: string;
  studentId?: string | null;
  plan: {
    name: string;
    description?: string | null;
    planKind?: "template" | "student";
    studentNames?: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanDialog({ planId, studentId, plan, open, onOpenChange }: EditPlanDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EditPlanValues | null>(null);

  const form = useForm<EditPlanValues>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: { name: plan.name, description: plan.description ?? "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: plan.name, description: plan.description ?? "" });
    }
  }, [open, plan, form]);

  const mutation = useMutation({
    mutationFn: (args: { values: EditPlanValues; forkForStudentId?: string }) =>
      updateWorkoutPlan(planId, {
        name: args.values.name,
        description: args.values.description || undefined,
        forkForStudentId: args.forkForStudentId,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["workout-plan", planId], updated);
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Treino atualizado.");
      setDecisionOpen(false);
      onOpenChange(false);

      if (updated.id !== planId) {
        // Redireciona para o plano criado via fork
        const nextUrl = studentId
          ? `/painel/treinos/${updated.id}?studentId=${studentId}`
          : `/painel/treinos/${updated.id}`;
        router.push(nextUrl);
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o treino."));
    },
  });

  const onSubmit = (values: EditPlanValues) => {
    if (plan.planKind === "template" && studentId) {
      setPendingValues(values);
      setDecisionOpen(true);
    } else {
      mutation.mutate({ values });
    }
  };

  const handleUpdateTemplate = () => {
    if (pendingValues) {
      mutation.mutate({ values: pendingValues });
    }
  };

  const handleFork = () => {
    if (pendingValues && studentId) {
      mutation.mutate({ values: pendingValues, forkForStudentId: studentId });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descrição (opcional)</Label>
              <Textarea id="edit-desc" rows={3} {...form.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TemplateEditDecisionDialog
        open={decisionOpen}
        onOpenChange={(v) => !v && setDecisionOpen(false)}
        onCancel={() => setDecisionOpen(false)}
        onFork={handleFork}
        onUpdateTemplate={handleUpdateTemplate}
        isPending={mutation.isPending}
      />
    </>
  );
}
