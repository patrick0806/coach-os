"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { createWorkoutPlan } from "@/services/workout-plans.service";

const createPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type CreatePlanValues = z.infer<typeof createPlanSchema>;

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  onCreated,
}: CreatePlanDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreatePlanValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: async (values: CreatePlanValues) => {
      const created = await createWorkoutPlan({
        name: values.name,
        description: values.description || undefined,
        planKind: "template",
      });
      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Modelo de treino criado.");
      onOpenChange(false);
      form.reset({ name: "", description: "" });
      onCreated(created.id);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o modelo."));
    },
  });

  function handleOpenChange(open: boolean) {
    if (!open) {
      form.reset({ name: "", description: "" });
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo modelo de treino</DialogTitle>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Criando..." : "Criar modelo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
