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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function listPlans(): Promise<Plan[]> {
  try {
    const response = await fetch(`${API_URL}/plans`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const json = await response.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}
