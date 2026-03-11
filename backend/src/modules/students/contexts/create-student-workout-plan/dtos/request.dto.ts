import { z } from "zod";

export const CreateStudentWorkoutPlanSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
});

export type CreateStudentWorkoutPlanInput = z.infer<typeof CreateStudentWorkoutPlanSchema>;
