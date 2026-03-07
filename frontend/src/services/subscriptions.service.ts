import { api } from "@/lib/api";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "cancelled"
  | null;

export const SUBSCRIPTION_STATUS_LABELS: Record<NonNullable<SubscriptionStatus>, string> = {
  active: "Ativa",
  inactive: "Inativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  cancelled: "Cancelada",
};

export interface Subscription {
  status: SubscriptionStatus;
  planId: string | null;
  planName: string | null;
  expiresAt: string | null;
  stripeSubscriptionId: string | null;
}

export interface SubscriptionUsage {
  studentsUsed: number;
  studentsLimit: number;
  planName: string | null;
}

export async function getMySubscription(): Promise<Subscription> {
  const { data } = await api.get<Subscription>("/subscriptions/me");
  return data;
}

export async function getSubscriptionUsage(): Promise<SubscriptionUsage> {
  const { data } = await api.get<SubscriptionUsage>("/subscriptions/usage");
  return data;
}

export async function createCheckoutSession(planId: string): Promise<{ checkoutUrl: string }> {
  const { data } = await api.post<{ checkoutUrl: string }>("/subscriptions/checkout", { planId });
  return data;
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
