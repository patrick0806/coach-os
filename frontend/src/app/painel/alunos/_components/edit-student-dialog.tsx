"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { updateStudent, type Student } from "@/services/students.service";
import { listServicePlans } from "@/services/service-plans.service";

const studentFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Informe um e-mail válido"),
  servicePlanId: z.string().uuid("Selecione um plano de atendimento"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface EditStudentDialogProps {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentDialog({ student, onOpenChange }: EditStudentDialogProps) {
  const queryClient = useQueryClient();
  const servicePlansQuery = useQuery({
    queryKey: ["service-plans", "student-dialog"],
    queryFn: listServicePlans,
    enabled: Boolean(student),
    select: (plans) => plans.filter((plan) => plan.isActive),
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: student?.name ?? "",
      email: student?.email ?? "",
      servicePlanId: student?.servicePlanId ?? "",
    },
  });
  const servicePlanId = useWatch({ control: form.control, name: "servicePlanId" }) ?? "";

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name,
        email: student.email,
        servicePlanId: student.servicePlanId,
      });
    }
  }, [student, form]);

  const mutation = useMutation({
    mutationFn: (values: StudentFormValues) => updateStudent(student!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Dados do aluno atualizados.");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o aluno."));
    },
  });

  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar aluno</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" placeholder="João Silva" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">E-mail</Label>
            <Input
              id="edit-email"
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
