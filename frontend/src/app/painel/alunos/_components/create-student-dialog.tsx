"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { createStudent } from "@/services/students.service";
import { listServicePlans } from "@/services/service-plans.service";

const studentFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Informe um e-mail válido"),
  servicePlanId: z.string().uuid("Selecione um plano de atendimento"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface CreateStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStudentDialog({ open, onOpenChange }: CreateStudentDialogProps) {
  const queryClient = useQueryClient();
  const servicePlansQuery = useQuery({
    queryKey: ["service-plans", "student-form"],
    queryFn: listServicePlans,
    enabled: open,
    select: (plans) => plans.filter((plan) => plan.isActive),
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { name: "", email: "", servicePlanId: "" },
  });
  const servicePlanId = useWatch({ control: form.control, name: "servicePlanId" }) ?? "";

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(
        `Convite enviado para ${data.email}. O aluno receberá um link para definir sua senha.`,
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível cadastrar o aluno."));
    },
  });

  function handleOpenChange(value: boolean) {
    if (!value) form.reset();
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo aluno</DialogTitle>
          <DialogDescription>
            O aluno receberá um e-mail com o link para definir sua senha de acesso.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="create-name">Nome</Label>
            <Input id="create-name" placeholder="João Silva" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">E-mail</Label>
            <Input
              id="create-email"
              type="email"
              placeholder="joao@exemplo.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Plano de atendimento</Label>
            <Select
              value={servicePlanId}
              onValueChange={(value) =>
                form.setValue("servicePlanId", value, { shouldValidate: true, shouldDirty: true })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    servicePlansQuery.isLoading ? "Carregando planos..." : "Selecione um plano"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(servicePlansQuery.data ?? []).map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.servicePlanId ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.servicePlanId.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Cadastrando..." : "Cadastrar aluno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
