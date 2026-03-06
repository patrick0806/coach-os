import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const CreateExerciseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(150),
  description: z.string().max(1000).optional(),
  muscleGroup: z.enum(
    ["peito", "costas", "ombro", "biceps", "triceps", "perna", "gluteo", "core"],
    { message: "Grupo muscular inválido" },
  ),
});

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;

export class CreateExerciseDTO implements CreateExerciseInput {
  @ApiProperty({ example: "Meu Exercicio Customizado" })
  name: string;

  @ApiProperty({ required: false, example: "Descrição do exercício" })
  description?: string;

  @ApiProperty({
    example: "peito",
    enum: ["peito", "costas", "ombro", "biceps", "triceps", "perna", "gluteo", "core"],
  })
  muscleGroup: "peito" | "costas" | "ombro" | "biceps" | "triceps" | "perna" | "gluteo" | "core";
}
