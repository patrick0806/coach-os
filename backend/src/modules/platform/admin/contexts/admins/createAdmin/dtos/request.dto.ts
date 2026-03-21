import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const createAdminSchema = z.object({
  name: z.string().min(3).max(150),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

export class CreateAdminRequestDTO {
  @ApiProperty({ example: "Admin User", minLength: 3, maxLength: 150 })
  name: string;

  @ApiProperty({ example: "admin@example.com", format: "email", maxLength: 255 })
  email: string;

  @ApiProperty({ example: "Str0ngP@ss!", minLength: 8, maxLength: 100 })
  password: string;
}
