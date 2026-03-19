"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/shared/components/pageHeader";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import {
  useAdminTenant,
  useUpdateTenantStatus,
} from "@/features/admin/hooks/useAdminTenants";

const ACCESS_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "suspended",
  "expired",
] as const;

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  trialing: "outline",
  past_due: "destructive",
  suspended: "destructive",
  expired: "secondary",
};

export default function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: tenant, isLoading } = useAdminTenant(id);
  const updateStatus = useUpdateTenantStatus();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  async function handleStatusChange() {
    if (!selectedStatus || selectedStatus === tenant?.accessStatus) return;
    await updateStatus.mutateAsync({ id, accessStatus: selectedStatus });
  }

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!tenant) return <p className="text-muted-foreground">Tenant não encontrado.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <PageHeader title={tenant.name} description={tenant.email} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Slug</span>
              <span>{tenant.slug}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusColors[tenant.accessStatus] ?? "outline"}>
                {tenant.accessStatus}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Whitelist</span>
              <Badge variant={tenant.isWhitelisted ? "default" : "secondary"}>
                {tenant.isWhitelisted ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Onboarding</span>
              <Badge
                variant={tenant.onboardingCompleted ? "default" : "secondary"}
              >
                {tenant.onboardingCompleted ? "Completo" : "Pendente"}
              </Badge>
            </div>
            {tenant.createdAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Criado em</span>
                <span>
                  {new Date(tenant.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status Stripe</span>
              <span>{tenant.subscriptionStatus ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expira em</span>
              <span>
                {tenant.subscriptionExpiresAt
                  ? new Date(tenant.subscriptionExpiresAt).toLocaleDateString(
                      "pt-BR"
                    )
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trial termina</span>
              <span>
                {tenant.trialEndsAt
                  ? new Date(tenant.trialEndsAt).toLocaleDateString("pt-BR")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stripe Customer</span>
              <span className="text-xs truncate max-w-32">
                {tenant.stripeCustomerId ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Alterar Status de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Novo Status</Label>
              <Select
                value={selectedStatus || tenant.accessStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleStatusChange}
              disabled={
                updateStatus.isPending ||
                !selectedStatus ||
                selectedStatus === tenant.accessStatus
              }
            >
              Aplicar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
