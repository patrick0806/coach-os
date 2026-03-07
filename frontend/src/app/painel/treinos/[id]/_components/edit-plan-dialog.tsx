"use client";

import { useEffect } from "react";
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

const editPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type EditPlanValues = z.infer<typeof editPlanSchema>;

interface EditPlanDialogProps {
  planId: string;
  plan: { name: string; description?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanDialog({ planId, plan, open, onOpenChange }: EditPlanDialogProps) {
  const queryClient = useQueryClient();

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
    mutationFn: (values: EditPlanValues) =>
      updateWorkoutPlan(planId, {
        name: values.name,
        description: values.description || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["workout-plan", planId], updated);
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Plano atualizado.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o plano."));
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar plano</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
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
  );
}
