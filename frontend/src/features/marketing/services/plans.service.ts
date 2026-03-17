import { publicServerFetch } from "@/lib/serverFetch";
import type { Plan, PlanApiResponse } from "../types/plans.types";

export type { Plan };

function mapPlan(raw: PlanApiResponse): Plan {
  return {
    id: raw.id,
    name: raw.name,
    price: typeof raw.price === "string" ? parseFloat(raw.price) : raw.price,
    order: raw.order,
    limitOfStudents: raw.limitOfStudents ?? raw.maxStudents ?? 0,
    features: raw.features ?? raw.benefits ?? [],
    highlighted: raw.highlighted,
    hasTrial: raw.hasTrial ?? false,
  };
}

export async function listPlans(): Promise<Plan[]> {
  const raw = await publicServerFetch<PlanApiResponse[]>("/plans", {
    revalidate: 3600,
    tags: ["plans"],
  });

  return (raw ?? []).map(mapPlan);
}
