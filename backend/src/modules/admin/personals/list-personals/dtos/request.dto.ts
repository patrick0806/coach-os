import { z } from "zod";
import { ApiPropertyOptional } from "@nestjs/swagger";

export const ListPersonalsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type ListPersonalsQuery = z.input<typeof ListPersonalsQuerySchema>;

export class ListPersonalsQueryDTO {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  size?: number;

  @ApiPropertyOptional({ example: "john" })
  search?: string;
}
