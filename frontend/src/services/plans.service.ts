import { publicServerFetch } from "@/lib/serverFetch";

export interface Plan {
  id: string;
  name: string;
  price: number;
  order: number;
  limitOfStudents: number;
  features: string[];
  highlighted: boolean;
  hasTrial: boolean;
}

// Raw shape returned by the backend API
interface PlanApiResponse {
  id: string;
  name: string;
  price: string | number;
  order: number;
  maxStudents?: number;
  limitOfStudents?: number;
  benefits?: string[];
  features?: string[];
  highlighted: boolean;
  hasTrial: boolean;
}

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
