import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const PersonalCalendarQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from deve estar no formato YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to deve estar no formato YYYY-MM-DD"),
});

export type PersonalCalendarQuery = z.infer<typeof PersonalCalendarQuerySchema>;

export class PersonalCalendarQueryDTO implements PersonalCalendarQuery {
  @ApiProperty({ example: "2026-03-16", description: "Data inicial (YYYY-MM-DD)" })
  from: string;

  @ApiProperty({ example: "2026-03-22", description: "Data final (YYYY-MM-DD)" })
  to: string;
}
