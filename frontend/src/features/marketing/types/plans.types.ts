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
export interface PlanApiResponse {
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
