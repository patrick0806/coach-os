import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const ListStudentNotesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(50).default(10),
});

export type ListStudentNotesInput = z.infer<typeof ListStudentNotesSchema>;

export class ListStudentNotesQueryDTO implements Partial<ListStudentNotesInput> {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  size?: number;
}
