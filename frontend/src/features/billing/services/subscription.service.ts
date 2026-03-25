import { api } from "@/lib/axios";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  maxStudents: number;
  highlighted: boolean;
}

export interface SubscriptionDetails {
  plan: SubscriptionPlan | null;
  accessStatus: string;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
  studentsCount: number;
  studentsLimit: number;
  isWhitelisted: boolean;
}

export const subscriptionService = {
  async getCurrentSubscription(): Promise<SubscriptionDetails> {
    const response = await api.get<SubscriptionDetails>("/subscriptions/current");
    return response.data;
  },

  async changePlan(planId: string): Promise<void> {
    await api.patch("/subscriptions/plan", { planId });
  },

  async cancelSubscription(): Promise<{ subscriptionExpiresAt: string | null }> {
    const response = await api.post<{ subscriptionExpiresAt: string | null }>(
      "/subscriptions/cancel"
    );
    return response.data;
  },

  async getPortalUrl(): Promise<string> {
    const response = await api.post<{ url: string }>("/subscriptions/portal");
    return response.data.url;
  },

  async getCheckoutUrl(): Promise<string> {
    const response = await api.post<{ url: string }>("/subscriptions/checkout");
    return response.data.url;
  },
};
