"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardList, Pencil, Plus, Power } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  deactivateServicePlan,
  formatPrice,
  listServicePlans,
  type ServicePlan,
} from "@/services/service-plans.service";
import { ServicePlanDialog } from "./_components/service-plan-dialog";

export default function PlanosServicoPage() {
  const queryClient = useQueryClient();
  const [dialogPlan, setDialogPlan] = useState<ServicePlan | null | undefined>(undefined);
  const [deactivating, setDeactivating] = useState<ServicePlan | null>(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["service-plans"],
    queryFn: listServicePlans,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateServicePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-plans"] });
      toast.success("Plano desativado.");
      setDeactivating(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível desativar o plano."));
    },
  });

  const activePlans = plans.filter((p) => p.isActive);
  const inactivePlans = plans.filter((p) => !p.isActive);

  return (
    <>
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Planos de Serviço</h1>
            <p className="mt-1 text-sm text-gray-500">
              Seus pacotes de atendimento exibidos na sua página pública.
            </p>
          </div>
          <Button onClick={() => setDialogPlan(null)} className="gap-2">
            <Plus className="size-4" />
            Novo plano
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center text-gray-400">
              <ClipboardList className="mb-3 size-10 opacity-30" />
              <p>Você ainda não tem planos de serviço.</p>
              <Button variant="outline" className="mt-4" onClick={() => setDialogPlan(null)}>
                Criar primeiro plano
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activePlans.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-medium text-gray-500">Ativos</h2>
                <div className="space-y-3">
                  {activePlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={() => setDialogPlan(plan)}
                      onDeactivate={() => setDeactivating(plan)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {inactivePlans.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-medium text-gray-500">Inativos</h2>
                <div className="space-y-3">
                  {inactivePlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={() => setDialogPlan(plan)}
                      onDeactivate={undefined}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>

      {/* Dialog is open when dialogPlan is null (create) or a plan object (edit) */}
      <ServicePlanDialog
        open={dialogPlan !== undefined}
        onOpenChange={(open) => !open && setDialogPlan(undefined)}
        plan={dialogPlan ?? undefined}
      />

      <AlertDialog
        open={Boolean(deactivating)}
        onOpenChange={(open) => !open && setDeactivating(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar plano</AlertDialogTitle>
            <AlertDialogDescription>
              O plano <strong>{deactivating?.name}</strong> será removido da sua página pública.
              Você pode reativá-lo a qualquer momento editando-o.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deactivating && deactivateMutation.mutate(deactivating.id)}
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

interface PlanCardProps {
  plan: ServicePlan;
  onEdit: () => void;
  onDeactivate: (() => void) | undefined;
}

function PlanCard({ plan, onEdit, onDeactivate }: PlanCardProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4 ${
        !plan.isActive ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-900">{plan.name}</span>
          {!plan.isActive ? (
            <Badge variant="secondary" className="text-xs">
              Inativo
            </Badge>
          ) : null}
        </div>
        {plan.description ? (
          <p className="mt-0.5 text-sm text-gray-500">{plan.description}</p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-400">
          <span>{plan.sessionsPerWeek}x por semana</span>
          <span>·</span>
          <span>{plan.durationMinutes} min/sessão</span>
          <span>·</span>
          <span className="font-semibold text-gray-700">{formatPrice(plan.price)}/mês</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
          <Pencil className="size-3.5" />
          Editar
        </Button>
        {onDeactivate ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={onDeactivate}
          >
            <Power className="size-3.5" />
            Desativar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
