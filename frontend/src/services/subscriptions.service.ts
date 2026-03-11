import { api } from "@/lib/api";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "expired"
  | "past_due"
  | "canceled"
  | "cancelled"
  | null;

export const SUBSCRIPTION_STATUS_LABELS: Record<NonNullable<SubscriptionStatus>, string> = {
  active: "Ativa",
  inactive: "Inativa",
  trialing: "Em teste",
  expired: "Expirada",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  cancelled: "Cancelada",
};

export interface Subscription {
  status: SubscriptionStatus;
  planId: string | null;
  planName: string | null;
  expiresAt: string | null;
  stripeSubscriptionId: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
}

export interface SubscriptionUsage {
  studentsUsed: number;
  studentsLimit: number;
  planName: string | null;
}

export async function getMySubscription(): Promise<Subscription> {
  const { data } = await api.get<{
    status: SubscriptionStatus;
    plan?: { id: string; name: string } | null;
    planId?: string | null;
    planName?: string | null;
    expiresAt: string | null;
    stripeSubscriptionId?: string | null;
    trialStartedAt?: string | null;
    trialEndsAt?: string | null;
  }>("/subscriptions/me");

  return {
    status: data.status ?? null,
    planId: data.planId ?? data.plan?.id ?? null,
    planName: data.planName ?? data.plan?.name ?? null,
    expiresAt: data.expiresAt ?? null,
    stripeSubscriptionId: data.stripeSubscriptionId ?? null,
    trialStartedAt: data.trialStartedAt ?? null,
    trialEndsAt: data.trialEndsAt ?? null,
  };
}

export async function getSubscriptionUsage(): Promise<SubscriptionUsage> {
  const { data } = await api.get<SubscriptionUsage>("/subscriptions/usage");
  return data;
}

export async function createCheckoutSession(planId: string): Promise<{ checkoutUrl: string }> {
  const { data } = await api.post<{ checkoutUrl: string }>("/subscriptions/checkout", { planId });
  return data;
}

export async function syncCheckout(sessionId: string): Promise<void> {
  await api.post("/subscriptions/sync-checkout", { sessionId });
}

export async function cancelSubscription(): Promise<void> {
  await api.post("/subscriptions/cancel");
}

export async function openPortal(): Promise<{ portalUrl: string }> {
  const { data } = await api.post<{ portalUrl: string }>("/subscriptions/portal");
  return data;
}

export async function upgradeSubscription(planId: string): Promise<void> {
  await api.post("/subscriptions/upgrade", { planId });
}
