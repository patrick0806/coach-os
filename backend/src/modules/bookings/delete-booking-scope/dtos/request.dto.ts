import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

export const DeleteBookingScopeSchema = z.object({
  scope: z.enum(["single", "future", "all"]).default("single"),
});

export type DeleteBookingScopeInput = z.infer<typeof DeleteBookingScopeSchema>;

export class DeleteBookingScopeQueryDTO implements DeleteBookingScopeInput {
  @ApiPropertyOptional({
    enum: ["single", "future", "all"],
    default: "single",
    description: "Escopo de cancelamento: somente a sessão, esta e próximas, ou série inteira",
  })
  scope?: "single" | "future" | "all";
}
