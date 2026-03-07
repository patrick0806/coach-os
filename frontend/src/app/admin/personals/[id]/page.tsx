"use client";

import Link from "next/link";
import { use } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/api-error";
import { getAdminPersonal, togglePersonalStatus } from "@/services/admin.service";
import { SUBSCRIPTION_STATUS_LABELS } from "@/services/subscriptions.service";

interface AdminPersonalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminPersonalDetailPage({ params }: AdminPersonalDetailPageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: personal, isLoading } = useQuery({
    queryKey: ["admin-personal", id],
    queryFn: () => getAdminPersonal(id),
  });

  const toggleMutation = useMutation({
    mutationFn: () => togglePersonalStatus(id, !personal!.isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-personal", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-personals"] });
      toast.success(personal?.isActive ? "Conta desativada." : "Conta ativada.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível alterar o status."));
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-accent" />
          ))}
        </div>
      </div>
    );
  }

  if (!personal) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-muted-foreground">
        <p>Personal não encontrado.</p>
        <Link href="/admin/personals">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  const subStatus = personal.subscriptionStatus as keyof typeof SUBSCRIPTION_STATUS_LABELS | null;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <Link
        href="/admin/personals"
        className="-ml-1 mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Personals
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{personal.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{personal.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={
              personal.isActive
                ? "bg-green-900/30 text-green-400"
                : "bg-muted text-muted-foreground"
            }
          >
            {personal.isActive ? "Ativo" : "Inativo"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className={
              personal.isActive
                ? "text-destructive hover:text-destructive"
                : "text-green-400 hover:text-green-300"
            }
            disabled={toggleMutation.isPending}
            onClick={() => toggleMutation.mutate()}
          >
            {toggleMutation.isPending
              ? "Aguarde..."
              : personal.isActive
                ? "Desativar conta"
                : "Ativar conta"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Personal data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Dados do perfil
            </CardTitle>
          </CardHeader>
          <Separator className="bg-border/50" />
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
            <InfoRow label="Slug" value={`/${personal.slug}`} />
            <InfoRow label="Cadastro" value={new Date(personal.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} />
            {personal.phoneNumber ? (
              <InfoRow label="Telefone" value={personal.phoneNumber} />
            ) : null}
            {personal.bio ? (
              <div className="sm:col-span-2">
                <InfoRow label="Bio" value={personal.bio} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Assinatura
            </CardTitle>
          </CardHeader>
          <Separator className="bg-border/50" />
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
            <InfoRow label="Plano" value={personal.planName ?? "—"} />
            <InfoRow
              label="Status"
              value={
                subStatus && SUBSCRIPTION_STATUS_LABELS[subStatus]
                  ? SUBSCRIPTION_STATUS_LABELS[subStatus]
                  : "—"
              }
            />
            {personal.subscriptionExpiresAt ? (
              <InfoRow
                label="Expira em"
                value={new Date(personal.subscriptionExpiresAt).toLocaleDateString("pt-BR")}
              />
            ) : null}
            {personal.stripeSubscriptionId ? (
              <div>
                <p className="text-xs text-muted-foreground">Stripe ID</p>
                <a
                  href={`https://dashboard.stripe.com/subscriptions/${personal.stripeSubscriptionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {personal.stripeSubscriptionId.slice(0, 20)}…
                  <ExternalLink className="size-3" />
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
