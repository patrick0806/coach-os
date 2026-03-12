import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const ListTrainingSessionsSchema = z.object({
  from: z.string().regex(dateRegex, "from deve estar no formato YYYY-MM-DD"),
  to: z.string().regex(dateRegex, "to deve estar no formato YYYY-MM-DD"),
});

export type ListTrainingSessionsQueryInput = z.infer<typeof ListTrainingSessionsSchema>;

export class ListTrainingSessionsQueryDTO implements ListTrainingSessionsQueryInput {
  @ApiProperty({ example: "2026-03-12" })
  from: string;

  @ApiProperty({ example: "2026-04-12" })
  to: string;
}
