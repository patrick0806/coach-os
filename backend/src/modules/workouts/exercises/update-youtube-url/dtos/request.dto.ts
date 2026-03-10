import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

const YOUTUBE_DOMAINS = ["youtube.com", "www.youtube.com", "youtu.be"];

export const UpdateYoutubeUrlSchema = z.object({
  youtubeUrl: z
    .union([z.string().url("URL invalida"), z.null()])
    .refine((value) => {
      if (value === null) return true;

      try {
        const { hostname } = new URL(value);
        return YOUTUBE_DOMAINS.includes(hostname);
      } catch {
        return false;
      }
    }, "Apenas links do YouTube sao aceitos (youtube.com ou youtu.be)"),
});

export type UpdateYoutubeUrlInput = z.infer<typeof UpdateYoutubeUrlSchema>;

export class UpdateYoutubeUrlDTO implements UpdateYoutubeUrlInput {
  @ApiProperty({
    required: true,
    nullable: true,
    example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Link do YouTube ou null para remover o link atual",
  })
  youtubeUrl: string | null;
}
