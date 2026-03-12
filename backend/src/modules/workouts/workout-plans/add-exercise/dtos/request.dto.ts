import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const AddExerciseSchema = z.object({
  exerciseId: z.string().uuid("exerciseId inválido"),
  sets: z.number().int().min(1, "Séries deve ser pelo menos 1"),
  repetitions: z.number().int().min(1, "Repetições deve ser pelo menos 1"),
  load: z.string().max(50).optional(),
  restTime: z.string().max(50).optional(),
  executionTime: z.string().max(50).optional(),
  order: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type AddExerciseInput = z.infer<typeof AddExerciseSchema>;

export class AddExerciseDTO implements AddExerciseInput {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  exerciseId: string;

  @ApiProperty({ example: 3 })
  sets: number;

  @ApiProperty({ example: 12 })
  repetitions: number;

  @ApiProperty({ required: false, example: "20kg" })
  load?: string;

  @ApiProperty({ required: false, example: "60s" })
  restTime?: string;

  @ApiProperty({ required: false, example: "3s" })
  executionTime?: string;

  @ApiProperty({ required: false, example: 0 })
  order?: number;

  @ApiProperty({ required: false, example: "Manter escápulas retraídas" })
  notes?: string;
}
