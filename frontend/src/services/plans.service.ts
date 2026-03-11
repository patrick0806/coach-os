const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  benefits: string[];
  highlighted: boolean;
  order: number;
  maxStudents: number;
}

export function formatPlanPrice(price: string): string {
  return parseFloat(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function listPlans(): Promise<Plan[]> {
  try {
    const res = await fetch(`${API_URL}/plans`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json() as Promise<Plan[]>;
  } catch {
    return [];
  }
}
