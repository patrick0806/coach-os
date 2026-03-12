import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const StartSessionSchema = z.object({
  workoutPlanId: z.string().uuid("workoutPlanId deve ser um UUID válido"),
});

export type StartSessionInput = z.infer<typeof StartSessionSchema>;

export class StartSessionDTO implements StartSessionInput {
  @ApiProperty({ example: "uuid-workout-plan" })
  workoutPlanId: string;
}
